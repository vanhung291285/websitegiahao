
import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';

export const DatabaseService = {
  // --- VISITOR STATS ---
  trackVisit: async () => {
    try {
      const sessionId = sessionStorage.getItem('visitor_session_id') || crypto.randomUUID();
      sessionStorage.setItem('visitor_session_id', sessionId);
      await supabase.from('visitor_logs').upsert({ 
        session_id: sessionId,
        last_active: new Date().toISOString() 
      }, { onConflict: 'session_id' });
    } catch (e) { console.error("Tracking error", e); }
  },

  getVisitorStats: async () => {
    try {
      const { data: counters } = await supabase.from('site_counters').select('*');
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: onlineCount } = await supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).gt('last_active', tenMinsAgo);
      const statsMap: any = {};
      counters?.forEach(c => { statsMap[c.key] = parseInt(c.value); });
      return { total: statsMap['total_visits'] || 0, today: statsMap['today_visits'] || 0, month: statsMap['month_visits'] || 0, online: onlineCount || 1 };
    } catch (e) { return { total: 0, today: 0, month: 0, online: 1 }; }
  },

  // --- CONFIG ---
  getConfig: async (): Promise<SchoolConfig> => {
    const { data } = await supabase.from('school_config').select('*').limit(1).single();
    return data ? {
       name: data.name, 
       slogan: data.slogan, 
       logoUrl: data.logo_url, 
       faviconUrl: data.favicon_url,
       bannerUrl: data.banner_url, 
       principalName: data.principal_name, 
       address: data.address,
       phone: data.phone, 
       email: data.email, 
       hotline: data.hotline, 
       mapUrl: data.map_url,
       facebook: data.facebook, 
       youtube: data.youtube, 
       zalo: data.zalo, 
       website: data.website,
       showWelcomeBanner: data.show_welcome_banner, 
       homeNewsCount: data.home_news_count,
       homeShowProgram: data.home_show_program, 
       primaryColor: data.primary_color,
       titleColor: data.title_color, 
       titleShadowColor: data.title_shadow_color,
       metaTitle: data.meta_title, 
       metaDescription: data.meta_description,
       footerLinks: data.footer_links || []
    } as any : {} as any;
  },

  saveConfig: async (config: SchoolConfig) => {
    const { data: current } = await supabase.from('school_config').select('id').limit(1);
    const dbData = {
       name: config.name, 
       slogan: config.slogan, 
       logo_url: config.logoUrl, 
       favicon_url: config.faviconUrl,
       banner_url: config.bannerUrl, 
       principal_name: config.principalName, 
       address: config.address,
       phone: config.phone, 
       email: config.email, 
       hotline: config.hotline, 
       map_url: config.mapUrl,
       facebook: config.facebook, 
       youtube: config.youtube, 
       zalo: config.zalo, 
       website: config.website,
       show_welcome_banner: config.showWelcomeBanner, 
       home_news_count: config.homeNewsCount,
       home_show_program: config.homeShowProgram, 
       primary_color: config.primaryColor,
       title_color: config.titleColor, 
       title_shadow_color: config.titleShadowColor,
       meta_title: config.metaTitle, 
       meta_description: config.metaDescription, 
       footer_links: config.footerLinks
    };
    if (current && current.length > 0) return supabase.from('school_config').update(dbData).eq('id', current[0].id);
    return supabase.from('school_config').insert(dbData);
  },

  // --- SHARED CATEGORIES ---
  getCategories: async (moduleType?: 'news' | 'documents' | 'files') => {
      let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (moduleType) query = query.eq('module_type', moduleType);
      const { data } = await query;
      return (data || []).map(c => ({
          id: c.id, name: c.name, slug: c.slug, module_type: c.module_type, 
          parent_id: c.parent_id, description: c.description, order: c.display_order, is_active: c.is_active
      }));
  },

  getPostCategories: async (): Promise<PostCategory[]> => {
      const cats = await DatabaseService.getCategories('news');
      return cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, color: 'blue', order: c.order }));
  },

  deletePostCategory: async (id: string) => supabase.from('categories').delete().eq('id', id),

  savePostCategory: async (cat: PostCategory) => {
    const dbData = { name: cat.name, slug: cat.slug, module_type: 'news', display_order: cat.order };
    if (cat.id && cat.id.length > 10) return supabase.from('categories').update(dbData).eq('id', cat.id);
    return supabase.from('categories').insert(dbData);
  },

  getDocCategories: async (): Promise<DocumentCategory[]> => {
      const cats = await DatabaseService.getCategories('documents');
      return cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order }));
  },

  deleteDocCategory: async (id: string) => supabase.from('categories').delete().eq('id', id),

  saveDocCategory: async (cat: DocumentCategory) => {
    const dbData = { name: cat.name, slug: cat.slug, module_type: 'documents', description: cat.description, display_order: cat.order };
    if (cat.id && cat.id.length > 10) return supabase.from('categories').update(dbData).eq('id', cat.id);
    return supabase.from('categories').insert(dbData);
  },

  saveDocCategoriesOrder: async (cats: DocumentCategory[]) => {
    for (const cat of cats) {
      await supabase.from('categories').update({ display_order: cat.order }).eq('id', cat.id);
    }
  },

  // --- POSTS ---
  getPosts: async (): Promise<Post[]> => {
    const { data } = await supabase.from('posts').select('*').order('date', { ascending: false });
    return (data || []).map((p: any) => ({ 
        ...p, 
        blockIds: p.block_ids || [], 
        tags: p.tags || [], 
        attachments: p.attachments || [],
        isFeatured: p.is_featured,
        showOnHome: p.show_on_home
    }));
  },
  savePost: async (post: Post) => {
    const dbData = { 
        title: post.title, 
        slug: post.slug, 
        summary: post.summary, 
        content: post.content, 
        thumbnail: post.thumbnail, 
        author: post.author, 
        date: post.date, 
        category: post.category, 
        status: post.status, 
        is_featured: post.isFeatured, 
        show_on_home: post.showOnHome, 
        block_ids: post.blockIds, 
        tags: post.tags, 
        attachments: post.attachments 
    };
    if (post.id && post.id.length > 10) return supabase.from('posts').update(dbData).eq('id', post.id);
    return supabase.from('posts').insert(dbData);
  },
  deletePost: async (id: string) => supabase.from('posts').delete().eq('id', id),

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<SchoolDocument[]> => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    return (data || []).map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
  },
  saveDocument: async (doc: SchoolDocument) => {
    const dbData = { number: doc.number, title: doc.title, date: doc.date, download_url: doc.downloadUrl, category_id: doc.categoryId };
    if (doc.id && doc.id.length > 10) return supabase.from('documents').update(dbData).eq('id', doc.id);
    return supabase.from('documents').insert(dbData);
  },
  deleteDocument: async (id: string) => supabase.from('documents').delete().eq('id', id),

  // --- BLOCKS ---
  getBlocks: async (): Promise<DisplayBlock[]> => {
      const { data } = await supabase.from('display_blocks').select('*').order('order_index', { ascending: true });
      return (data || []).map((b: any) => ({
          id: b.id, name: b.name, position: b.position, type: b.type, order: b.order_index, 
          itemCount: b.item_count, isVisible: b.is_visible, htmlContent: b.html_content, 
          targetPage: b.target_page, customColor: b.custom_color, customTextColor: b.custom_text_color
      }));
  },
  saveBlock: async (block: DisplayBlock) => {
      const dbData = { 
          name: block.name, 
          position: block.position, 
          type: block.type, 
          order_index: block.order, 
          item_count: block.itemCount, 
          is_visible: block.isVisible, 
          html_content: block.htmlContent, 
          target_page: block.targetPage, 
          custom_color: block.customColor, 
          custom_text_color: block.customTextColor 
      };
      const isRealUuid = block.id && block.id.includes('-') && block.id.length > 20;
      if (isRealUuid) return supabase.from('display_blocks').update(dbData).eq('id', block.id);
      return supabase.from('display_blocks').insert([dbData]);
  },
  deleteBlock: async (id: string) => supabase.from('display_blocks').delete().eq('id', id),
  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
    for (const b of blocks) {
      await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id);
    }
  },

  // --- STAFF ---
  getStaff: async (): Promise<StaffMember[]> => {
    const { data } = await supabase.from('staff_members').select('*').order('order_index', { ascending: true });
    return (data || []).map((s: any) => ({ id: s.id, fullName: s.full_name, position: s.position, partyDate: s.party_date, email: s.email, avatarUrl: s.avatar_url, order: s.order_index }));
  },
  saveStaff: async (staff: StaffMember) => {
    const dbData = { full_name: staff.fullName, position: staff.position, party_date: staff.partyDate || null, email: staff.email, avatar_url: staff.avatarUrl, order_index: staff.order };
    if (staff.id && staff.id.length > 10) return supabase.from('staff_members').update(dbData).eq('id', staff.id);
    return supabase.from('staff_members').insert(dbData);
  },
  deleteStaff: async (id: string) => supabase.from('staff_members').delete().eq('id', id),

  // --- MENU ---
  getMenu: async (): Promise<MenuItem[]> => {
      const { data } = await supabase.from('menu_items').select('*').order('order_index', { ascending: true });
      return (data || []).map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
  },
  saveMenu: async (items: MenuItem[]) => {
      for (const m of items) {
          const dbData = { label: m.label, path: m.path, order_index: m.order };
          // PHÂN BIỆT THỰC SỰ GIỮA INSERT VÀ UPDATE CHO MENU
          const isRealUuid = m.id && m.id.includes('-') && m.id.length > 20;
          
          if (isRealUuid) {
              await supabase.from('menu_items').update(dbData).eq('id', m.id);
          } else {
              await supabase.from('menu_items').insert([dbData]);
          }
      }
  },
  deleteMenu: async (id: string) => supabase.from('menu_items').delete().eq('id', id),

  // --- GALLERY ---
  getAlbums: async (): Promise<GalleryAlbum[]> => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
  },
  saveAlbum: async (album: GalleryAlbum) => {
    const dbData = { title: album.title, description: album.description, thumbnail: album.thumbnail, created_date: album.createdDate };
    if (album.id && album.id.length > 10) return supabase.from('gallery_albums').update(dbData).eq('id', album.id);
    return supabase.from('gallery_albums').insert(dbData);
  },
  deleteAlbum: async (id: string) => supabase.from('gallery_albums').delete().eq('id', id),
  getGallery: async (): Promise<GalleryImage[]> => {
     const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
     return (data || []).map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
  },
  saveImage: async (img: GalleryImage) => supabase.from('gallery_images').insert({ url: img.url, caption: img.caption, album_id: img.albumId }),
  deleteImage: async (id: string) => supabase.from('gallery_images').delete().eq('id', id),

  // --- VIDEOS ---
  getVideos: async (): Promise<Video[]> => {
    const { data } = await supabase.from('videos').select('*').order('order_index', { ascending: true });
    return (data || []).map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, order: v.order_index }));
  },
  saveVideo: async (video: Video) => {
    const dbData = { title: video.title, youtube_url: video.youtubeUrl, order_index: video.order };
    if (video.id && video.id.length > 10) return supabase.from('videos').update(dbData).eq('id', video.id);
    return supabase.from('videos').insert(dbData);
  },
  deleteVideo: async (id: string) => supabase.from('videos').delete().eq('id', id),

  // --- INTRODUCTIONS ---
  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    const { data } = await supabase.from('school_introductions').select('*').order('order_index', { ascending: true });
    return (data || []).map((i: any) => ({ id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible }));
  },
  saveIntroduction: async (intro: IntroductionArticle) => {
    const dbData = { title: intro.title, slug: intro.slug, content: intro.content, image_url: intro.imageUrl, order_index: intro.order, is_visible: intro.isVisible };
    if (intro.id && intro.id.length > 10) return supabase.from('school_introductions').update(dbData).eq('id', intro.id);
    return supabase.from('school_introductions').insert(dbData);
  },
  deleteIntroduction: async (id: string) => supabase.from('school_introductions').delete().eq('id', id),

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('user_profiles').select('*');
    return (data || []).map(u => ({ 
      id: u.id, 
      username: u.username, 
      fullName: u.full_name, 
      role: u.role as UserRole, 
      email: u.email, 
      avatarUrl: u.avatar_url 
    }));
  },
  saveUser: async (user: User) => {
    const dbData = { 
      full_name: user.fullName, 
      username: user.username, 
      role: user.role, 
      email: user.email, 
      avatar_url: user.avatarUrl 
    };
    if (user.id && user.id.length > 10) return supabase.from('user_profiles').update(dbData).eq('id', user.id);
    return supabase.from('user_profiles').insert(dbData);
  },
  deleteUser: async (id: string) => supabase.from('user_profiles').delete().eq('id', id),
};
