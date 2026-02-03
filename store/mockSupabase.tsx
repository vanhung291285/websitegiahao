
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, User, SchoolStats, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

// Fallback data để app không bị trắng trang nếu chưa config Supabase
const FALLBACK_POSTS: Post[] = [
  {
    id: 'demo-1',
    title: 'Vui lòng cấu hình Supabase để xem dữ liệu thật',
    slug: 'config-supabase',
    // Fixed: Change excerpt to summary
    summary: 'Hệ thống đang chạy ở chế độ Demo. Hãy kết nối Database.',
    content: 'Hãy chạy script SQL trong file supabase_schema.sql và cập nhật API Key.',
    // Fixed: Change image_url to thumbnail
    thumbnail: 'https://picsum.photos/800/600',
    author: 'System',
    // Fixed: Use string literal for category
    category: 'announcement',
    views: 0,
    // Fixed: Change created_at to date
    date: new Date().toISOString(),
    // Fixed: Change is_published to status
    status: 'published',
    isFeatured: false,
    showOnHome: true,
    blockIds: [],
    attachments: [],
    tags: []
  }
];

interface AppState {
  posts: Post[];
  user: User | null;
  stats: SchoolStats;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'date' | 'views'>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<SchoolStats>({ students: 0, teachers: 0, classes: 0, awards: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data & Realtime Subscription
  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        if (mounted && data) {
          // Map Supabase data to our Type (handling potential inconsistencies)
          setPosts(data as Post[]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts(FALLBACK_POSTS);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const fetchStats = async () => {
        // Trong thực tế có thể fetch từ bảng 'stats' hoặc count(*)
        // Demo: Hardcode hoặc lấy từ DB nếu có bảng
        setStats({ students: 1560, teachers: 125, classes: 48, awards: 342 });
    };

    fetchPosts();
    fetchStats();

    // REALTIME: Lắng nghe thay đổi trên bảng 'posts'
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('Realtime Change:', payload);
        fetchPosts(); // Reload data khi có thay đổi (INSERT/UPDATE/DELETE)
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Auth State Listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Lấy thêm thông tin profile nếu cần
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || 'Admin User',
          username: session.user.email?.split('@')[0] || 'admin',
          // Fixed: Change 'admin' string to UserRole.ADMIN
          role: UserRole.ADMIN, // Demo: Assume everyone logged in is admin
          avatarUrl: session.user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=Admin',
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    return { error: error?.message };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addPost = async (newPostData: Omit<Post, 'id' | 'date' | 'views'>) => {
    // Optimistic UI update could go here
    const { error } = await supabase.from('posts').insert([{
      ...newPostData,
      views: 0,
      // date tự sinh bởi DB
    }]);
    if (error) {
        alert("Lỗi thêm bài viết: " + error.message);
    }
  };

  const updatePost = async (id: string, updatedData: Partial<Post>) => {
    const { error } = await supabase.from('posts').update(updatedData).eq('id', id);
    if (error) {
        alert("Lỗi cập nhật: " + error.message);
    }
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
        alert("Lỗi xóa: " + error.message);
    }
  };

  return (
    <AppContext.Provider value={{
      posts,
      user,
      stats,
      isAdmin: !!user, // Logic đơn giản: cứ login là admin
      isLoading,
      login,
      logout,
      addPost,
      updatePost,
      deletePost
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};
