
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar'; 
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Introduction } from './pages/Introduction';
import { Documents } from './pages/Documents';
import { Gallery } from './pages/Gallery';
import { Staff } from './pages/Staff'; 
import { Login } from './pages/Login'; 
import { FloatingContact } from './components/FloatingContact';
import { NewsTicker } from './components/NewsTicker'; 
import { ManageNews } from './pages/admin/ManageNews';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageVideos } from './pages/admin/ManageVideos';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ManageBlocks } from './pages/admin/ManageBlocks';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageIntro } from './pages/admin/ManageIntro';
import { ManagePostCategories } from './pages/admin/ManagePostCategories'; 
import { Dashboard } from './pages/admin/Dashboard';
import { DatabaseService } from './services/database'; 
import { supabase } from './services/supabaseClient';
import { PageRoute, Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, DisplayBlock, MenuItem, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from './types';
import { Loader2, Share2, Facebook, Printer, Link as LinkIcon, Calendar } from 'lucide-react';

const FALLBACK_CONFIG: SchoolConfig = {
  name: 'Trường PTDTBT TH và THCS Suối Lư',
  slogan: 'Trách nhiệm - Yêu thương - Sáng tạo',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '',
  email: '',
  hotline: '',
  mapUrl: '',
  facebook: '',
  youtube: '',
  zalo: '',
  website: '',
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a',
  titleColor: '#fbbf24',
  titleShadowColor: 'rgba(0,0,0,0.8)',
  metaTitle: 'Trường PTDTBT TH và THCS Suối Lư',
  metaDescription: 'Cổng thông tin điện tử Trường PTDTBT TH và THCS Suối Lư'
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const [introductions, setIntroductions] = useState<IntroductionArticle[]>([]); 
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Memoize Derived Data for Performance
  const publishedPosts = useMemo(() => posts.filter(p => p.status === 'published'), [posts]);
  const sortedBlocks = useMemo(() => blocks.filter(b => b.isVisible).sort((a,b) => a.order - b.order), [blocks]);
  const sortedMenu = useMemo(() => menuItems.sort((a,b) => a.order - b.order), [menuItems]);
  const sortedIntros = useMemo(() => introductions.filter(i => i.isVisible).sort((a,b) => a.order - b.order), [introductions]);

  const formatDateOnly = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return dateStr; }
  }, []);

  const safePushState = (url: string) => {
    try { window.history.pushState({}, '', url); } catch (e) {}
  };

  const refreshData = async (showLoader: boolean = true) => {
    if (showLoader) setLoading(true);
    try {
        const [fc, fp, fd, fdc, fg, fa, fv, fb, fm, fs, fi, fpc] = await Promise.all([
            DatabaseService.getConfig().catch(() => FALLBACK_CONFIG),
            DatabaseService.getPosts().catch(() => []),
            DatabaseService.getDocuments().catch(() => []),
            DatabaseService.getDocCategories().catch(() => []),
            DatabaseService.getGallery().catch(() => []),
            DatabaseService.getAlbums().catch(() => []),
            DatabaseService.getVideos().catch(() => []),
            DatabaseService.getBlocks().catch(() => []),
            DatabaseService.getMenu().catch(() => []),
            DatabaseService.getStaff().catch(() => []),
            DatabaseService.getIntroductions().catch(() => []),
            DatabaseService.getPostCategories().catch(() => [])
        ]);
        setConfig(fc); setPosts(fp); setDocuments(fd); setDocCategories(fdc);
        setGalleryImages(fg); setAlbums(fa); setVideos(fv); setBlocks(fb);
        setMenuItems(fm); setStaffList(fs); setIntroductions(fi); setPostCategories(fpc);
    } catch (error) {
        if (!config) setConfig(FALLBACK_CONFIG);
    } finally {
        if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    DatabaseService.trackVisit();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session) {
         setCurrentUser({ id: session.user.id, email: session.user.email || '', fullName: 'Admin User', username: session.user.email?.split('@')[0] || 'admin', role: UserRole.ADMIN });
       } else { setCurrentUser(null); }
    });
    const handleUrlRouting = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page') as PageRoute;
      const idParam = searchParams.get('id');
      if (window.location.pathname.includes('/admin')) setCurrentPage('login'); 
      else { setCurrentPage(pageParam || 'home'); if (idParam) setDetailId(idParam); }
    };
    window.addEventListener('popstate', handleUrlRouting);
    handleUrlRouting();
    return () => { subscription.unsubscribe(); window.removeEventListener('popstate', handleUrlRouting); };
  }, []);

  useEffect(() => {
    if (config) {
        document.title = config.metaTitle || config.name;
        if (config.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
            link.rel = 'icon'; link.href = config.faviconUrl; document.head.appendChild(link);
        }
    }
  }, [config]);

  const navigate = (path: string, id?: string) => {
    if (path.startsWith('admin') && !currentUser) { setCurrentPage('login'); safePushState('/?page=login'); return; }
    if (id) setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);
    const newUrl = path === 'home' ? '/' : path === 'login' ? '/admin' : `/?page=${path}${id ? `&id=${id}` : ''}`;
    safePushState(newUrl);
  };

  if (loading || !config) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="flex flex-col items-center space-y-4"><Loader2 size={48} className="animate-spin text-blue-600" /><p className="text-gray-500 font-medium italic">Vui lòng chờ giây lát...</p></div></div>;
  }

  if (currentPage === 'login') return <Login onLoginSuccess={(u) => { setCurrentUser(u); navigate('admin-dashboard'); }} onNavigate={navigate} />;

  if (currentPage.startsWith('admin-')) {
    if (!currentUser) return <Login onLoginSuccess={(u) => { setCurrentUser(u); navigate('admin-dashboard'); }} onNavigate={navigate} />;
    return (
      <AdminLayout activePage={currentPage} onNavigate={navigate} currentUser={currentUser} onLogout={async () => { await supabase.auth.signOut(); setCurrentUser(null); navigate('login'); }}>
        {currentPage === 'admin-dashboard' && <Dashboard posts={posts} />}
        {currentPage === 'admin-news' && <ManageNews posts={posts} categories={postCategories} refreshData={refreshData} />}
        {currentPage === 'admin-categories' && <ManagePostCategories refreshData={refreshData} />}
        {currentPage === 'admin-videos' && <ManageVideos refreshData={refreshData} />}
        {currentPage === 'admin-intro' && <ManageIntro refreshData={refreshData} />}
        {currentPage === 'admin-blocks' && <ManageBlocks />}
        {currentPage === 'admin-docs' && <ManageDocuments documents={documents} categories={docCategories} refreshData={refreshData} />}
        {currentPage === 'admin-gallery' && <ManageGallery images={galleryImages} albums={albums} refreshData={refreshData} />}
        {currentPage === 'admin-staff' && <ManageStaff refreshData={refreshData} />} 
        {currentUser.role === UserRole.ADMIN && (
          <>{currentPage === 'admin-users' && <ManageUsers refreshData={refreshData} />}{currentPage === 'admin-menu' && <ManageMenu refreshData={refreshData} />}{currentPage === 'admin-settings' && <ManageSettings />}</>
        )}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header config={config} menuItems={sortedMenu} onNavigate={navigate} activePath={currentPage} />
      {!currentPage.startsWith('admin-') && <NewsTicker posts={publishedPosts} onNavigate={navigate} primaryColor={config.primaryColor} />}
      <main className="flex-grow w-full">
        {currentPage === 'home' && <Home posts={posts} postCategories={postCategories} docCategories={docCategories} documents={documents} staffList={staffList} config={config} gallery={galleryImages} videos={videos} blocks={sortedBlocks} introductions={sortedIntros} onNavigate={navigate} />}
        {currentPage === 'intro' && <Introduction config={config} />}
        {currentPage === 'staff' && <Staff staffList={staffList} />}
        {currentPage === 'documents' && <Documents documents={documents} categories={docCategories} initialCategorySlug="official" />}
        {currentPage === 'resources' && <Documents documents={documents} categories={docCategories} initialCategorySlug="resource" />}
        {currentPage === 'gallery' && <Gallery images={galleryImages} albums={albums} />}
        {currentPage === 'news' && (
          <div className="container mx-auto px-4 py-10">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <div className="flex items-center mb-8 pb-2 border-b-2 border-blue-900"><h2 className="text-2xl font-bold text-blue-900 uppercase">Tin tức & Sự kiện</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {publishedPosts.map(post => {
                    const cat = postCategories.find(c => c.slug === post.category);
                    return (<div key={post.id} onClick={() => navigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full"><div className="overflow-hidden rounded mb-3 border border-gray-200"><img src={post.thumbnail} loading="lazy" className="h-48 w-full object-cover transform group-hover:scale-105 transition duration-500" alt={post.title}/></div><span className={`text-xs font-bold uppercase mb-1 block text-${cat?.color || 'blue'}-600`}>{cat?.name || 'Tin tức'}</span><h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 leading-snug">{post.title}</h3><p className="text-gray-700 text-sm line-clamp-2 mb-2 flex-grow italic">{post.summary}</p><div className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100 flex items-center gap-4"><span className="flex items-center gap-1 font-bold"><Calendar size={12}/> {formatDateOnly(post.date)}</span></div></div>);
                })}
                </div>
            </div>
          </div>
        )}
        {currentPage === 'news-detail' && detailId && (
          <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {(() => {
                      const post = posts.find(p => p.id === detailId);
                      if (!post) return <div className="p-10 text-center bg-white rounded shadow italic">Bài viết không tồn tại</div>;
                      const cat = postCategories.find(c => c.slug === post.category);
                      return (<article className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200"><div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1><div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm border-b pb-4 border-gray-100 mb-4"><span className={`font-bold text-${cat?.color || 'blue'}-700 uppercase`}>{cat?.name || post.category}</span><span>|</span><span className="flex items-center gap-1 font-bold"><Calendar size={14} className="text-blue-600"/> {formatDateOnly(post.date)}</span><span>|</span><span className="italic font-medium">Tác giả: {post.author}</span></div><div className="flex flex-wrap items-center gap-3 mb-8 bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Share2 size={14}/> Chia sẻ:</span><button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] text-white rounded-md text-[13px] font-bold hover:brightness-110 shadow-sm"><Facebook size={14} fill="currentColor"/> Facebook</button><button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Đã copy liên kết!"); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-[13px] font-bold hover:brightness-110 shadow-sm"><LinkIcon size={14}/> Sao chép</button><button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-md text-[13px] font-bold hover:brightness-110 shadow-sm"><Printer size={14}/> In trang</button></div></div><div className="font-semibold text-lg text-gray-800 mb-6 italic bg-gray-50 p-4 border-l-4 border-blue-500 rounded-r">{post.summary}</div><div className="prose prose-blue prose-lg max-w-none text-gray-900 leading-relaxed text-justify news-content-area" dangerouslySetInnerHTML={{ __html: post.content }}/>{post.tags && post.tags.length > 0 && (<div className="mt-10 pt-6 border-t border-gray-100"><div className="flex flex-wrap gap-2"><span className="text-sm font-bold text-gray-400 uppercase mr-2">Tags:</span>{post.tags.map(tag => (<span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 font-bold">#{tag}</span>))}</div></div>)}</article>);
                    })()}
                </div>
                <div className="lg:col-span-4"><Sidebar blocks={sortedBlocks.filter(b => b.position === 'sidebar')} posts={posts} postCategories={postCategories} docCategories={docCategories} documents={documents} onNavigate={navigate} currentPage="news-detail" videos={videos} /></div>
              </div>
          </div>
        )}
      </main>
      {config && <Footer config={config} />}
      {config && !currentPage.startsWith('admin-') && <FloatingContact config={config} />}
    </div>
  );
};

export default App;
