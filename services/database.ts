
import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from '../types';

// Helper: Lấy ngày giờ hiện tại Việt Nam dưới dạng số nguyên để so sánh toán học chính xác
const getVNTimeNumeric = () => {
  const now = new Date();
  const vnString = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' }); // DD/MM/YYYY
  const [day, month, year] = vnString.split('/');
  return {
    dateInt: parseInt(`${year}${month}${day}`), // 20241027
    monthInt: parseInt(`${year}${month}`)       // 202410
  };
};

export const DatabaseService = {
  // --- VISITOR STATS (TỐI ƯU HÓA: GIẢM TẦN SUẤT GHI DB) ---
  trackVisit: async () => {
    try {
      const { dateInt, monthInt } = getVNTimeNumeric();
      const lastTrackKey = 'last_db_track_time';
      const visitKey = `counted_visit_${dateInt}`;
      const nowTs = Date.now();
      
      // 1. Chỉ cập nhật Online Heartbeat tối đa 5 phút một lần để giảm tải ghi
      const lastTrack = parseInt(localStorage.getItem(lastTrackKey) || '0');
      if (nowTs - lastTrack > 5 * 60 * 1000) {
          const sessionId = sessionStorage.getItem('visitor_session_id') || crypto.randomUUID();
          sessionStorage.setItem('visitor_session_id', sessionId);
          
          await supabase.from('visitor_logs').upsert({ 
            session_id: sessionId,
            last_active: new Date().toISOString() 
          }, { onConflict: 'session_id' });
          
          localStorage.setItem(lastTrackKey, nowTs.toString());
      }

      // 2. Logic đếm lượt truy cập: Chỉ đếm 1 lần/ngày/thiết bị
      if (localStorage.getItem(visitKey)) return;

      // Lấy dữ liệu hiện tại (Sử dụng rpc hoặc select đơn giản)
      const { data: counters } = await supabase.from('site_counters').select('*');
      const statsMap: any = {};
      counters?.forEach(c => { statsMap[c.key] = parseInt(c.value); });

      const lastResetDate = statsMap['last_reset_date'] || 0;
      let newToday = statsMap['today_visits'] || 0;
      let newMonth = statsMap['month_visits'] || 0;
      let newTotal = statsMap['total_visits'] || 0;

      if (dateInt > lastResetDate) {
          newToday = 0;
          const lastResetMonth = Math.floor(lastResetDate / 100);
          if (monthInt > lastResetMonth) newMonth = 0;
      }

      newToday++; newMonth++; newTotal++;

      await supabase.from('site_counters').upsert([
          { key: 'today_visits', value: newToday },
          { key: 'month_visits', value: newMonth },
          { key: 'total_visits', value: newTotal },
          { key: 'last_reset_date', value: dateInt }
      ]);

      localStorage.setItem(visitKey, 'true');
    } catch (e) { /* Fail silently to not impact UI */ }
  },

  getVisitorStats: async () => {
    try {
      const { data: counters } = await supabase.from('site_counters').select('*');
      const statsMap: any = {};
      counters?.forEach(c => { statsMap[c.key] = parseInt(c.value); });

      // Lấy số người đang online (trong 10 phút) - Chỉ READ, không WRITE
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: onlineCount } = await supabase.from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gt('last_active', tenMinsAgo);

      const { dateInt, monthInt } = getVNTimeNumeric();
      const lastResetDate = statsMap['last_reset_date'] || 0;
      const lastResetMonth = Math.floor(lastResetDate / 100);

      let displayToday = statsMap['today_visits'] || 0;
      let displayMonth = statsMap['month_visits'] || 0;
      let displayTotal = statsMap['total_visits'] || 0;

      if (dateInt > lastResetDate) {
          displayToday = 0; 
          if (monthInt > lastResetMonth) displayMonth = 0; 
      }

      const currentOnline = Math.max(onlineCount || 1, 1);
      return { 
          total: displayTotal + currentOnline, 
          today: displayToday + currentOnline, 
          month: displayMonth + currentOnline, 
          online: currentOnline 
      };
    } catch (e) { return { total: 0, today: 0, month: 0, online: 1 }; }
  },

  // --- CONFIG (Memoized or fast fetch) ---
  getConfig: async (): Promise<SchoolConfig> => {
    const { data } = await supabase.from('school_config').select('*').limit(1).single();
    return data ? {
       name: data.name, slogan: data.slogan, logoUrl: data.logo_url, 
       faviconUrl: data.favicon_url, bannerUrl: data.banner_url,
       bannerHeight: data.banner_height || 400,
       principalName: data.principal_name, address: data.address,
       phone: data.phone, email: data.email, hotline: data.hotline, 
       mapUrl: data.map_url, facebook: data.facebook, youtube: data.youtube, 
       zalo: data.zalo, website: data.website,
       showWelcomeBanner: data.show_welcome_banner, 
       homeNewsCount: data.home_news_count,
       homeShowProgram: data.home_show_program, primaryColor: data.primary_color,
       titleColor: data.title_color, titleShadowColor: data.title_shadow_color,
       metaTitle: data.meta_title, metaDescription: data.meta_description,
       footerLinks: data.footer_links || []
    } as any : {} as any;
  },

  saveConfig: async (config: SchoolConfig) => {
    const { data: current } = await supabase.from('school_config').select('id').limit(1);
    const dbData = {
       name: config.name, slogan: config.slogan, logo_url: config.logoUrl, 
       favicon_url: config.faviconUrl, banner_url: config.bannerUrl, 
       banner_height: config.bannerHeight || 400,
       principal_name: config.principalName, address: config.address,
       phone: config.phone, email: config.email, hotline: config.hotline, 
       map_url: config.mapUrl, facebook: config.facebook, youtube: config.youtube, 
       zalo: config.zalo, website: config.website,
       show_welcome_banner: config.showWelcomeBanner, 
       home_news_count: config.homeNewsCount,
       home_show_program: config.homeShowProgram, 
       primary_color: config.primaryColor,
       title_color: config.titleColor, title_shadow_color: config.titleShadowColor,
       meta_title: config.metaTitle, meta_description: config.metaDescription, 
       footer_links: config.footerLinks
    };
    if (current && current.length > 0) return supabase.from('school_config').update(dbData).eq('id', current[0].id);
    return supabase.from('school_config').insert(dbData);
  },

  // --- POSTS ---
  getPosts: async (): Promise<Post[]> => {
    const { data } = await supabase.from('posts').select('*').order('date', { ascending: false });
    return (data || []).map((p: any) => ({ 
        ...p, blockIds: p.block_ids || [], tags: p.tags || [], 
        attachments: p.attachments || [], isFeatured: p.is_featured, show_on_home: p.show_on_home
    }));
  },
  savePost: async (post: Post) => {
    const dbData = { 
        title: post.title, slug: post.slug, summary: post.summary, content: post.content, 
        thumbnail: post.thumbnail, author: post.author, date: post.date, category: post.category, 
        status: post.status, is_featured: post.isFeatured, show_on_home: post.showOnHome, 
        block_ids: post.blockIds, tags: post.tags, attachments: post.attachments 
    };
    if (post.id && post.id.length > 10) return supabase.from('posts').update(dbData).eq('id', post.id);
    return supabase.from('posts').insert(dbData);
  },
  deletePost: async (id: string) => supabase.from('posts').delete().eq('id', id),

  // --- OTHERS (Simplified for performance) ---
  getCategories: async (type?: string) => {
      let q = supabase.from('categories').select('*').order('display_order');
      if (type) q = q.eq('module_type', type);
      const { data } = await q;
      return data || [];
  },
  getPostCategories: async () => {
      const cats = await DatabaseService.getCategories('news');
      return cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, color: 'blue', order: c.display_order }));
  },
  getDocCategories: async () => {
      const cats = await DatabaseService.getCategories('documents');
      return cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.display_order }));
  },
  // Add category management methods
  saveDocCategory: async (cat: any) => {
    const dbData = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      display_order: cat.order,
      module_type: 'documents'
    };
    if (cat.id && cat.id.includes('-')) return supabase.from('categories').update(dbData).eq('id', cat.id);
    return supabase.from('categories').insert(dbData);
  },
  deleteDocCategory: async (id: string) => supabase.from('categories').delete().eq('id', id),
  saveDocCategoriesOrder: async (cats: any[]) => {
    for (const cat of cats) {
      await supabase.from('categories').update({ display_order: cat.order }).eq('id', cat.id);
    }
  },
  savePostCategory: async (cat: any) => {
    const dbData = {
      name: cat.name,
      slug: cat.slug,
      display_order: cat.order,
      module_type: 'news'
    };
    if (cat.id && cat.id.includes('-')) return supabase.from('categories').update(dbData).eq('id', cat.id);
    return supabase.from('categories').insert(dbData);
  },
  deletePostCategory: async (id: string) => supabase.from('categories').delete().eq('id', id),

  getDocuments: async () => {
    const { data } = await supabase.from('documents').select('*').order('date', { ascending: false });
    return (data || []).map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
  },
  saveDocument: async (doc: any) => supabase.from('documents').upsert({ id: doc.id || undefined, number: doc.number, title: doc.title, date: doc.date, download_url: doc.downloadUrl, category_id: doc.categoryId }),
  deleteDocument: async (id: string) => supabase.from('documents').delete().eq('id', id),
  getBlocks: async () => {
      const { data } = await supabase.from('display_blocks').select('*').order('order_index');
      return (data || []).map((b: any) => ({ id: b.id, name: b.name, position: b.position, type: b.type, order: b.order_index, itemCount: b.item_count, isVisible: b.is_visible, htmlContent: b.html_content, targetPage: b.target_page, customColor: b.custom_color, customTextColor: b.custom_text_color }));
  },
  saveBlock: async (b: any) => supabase.from('display_blocks').upsert({ id: (b.id && b.id.includes('-')) ? b.id : undefined, name: b.name, position: b.position, type: b.type, order_index: b.order, item_count: b.itemCount, is_visible: b.isVisible, html_content: b.htmlContent, target_page: b.targetPage, custom_color: b.customColor, custom_text_color: b.customTextColor }),
  deleteBlock: async (id: string) => supabase.from('display_blocks').delete().eq('id', id),
  saveBlocksOrder: async (blks: any[]) => { for (const b of blks) await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id); },
  getStaff: async () => {
    const { data } = await supabase.from('staff_members').select('*').order('order_index');
    return (data || []).map((s: any) => ({ id: s.id, fullName: s.full_name, position: s.position, partyDate: s.party_date, email: s.email, avatarUrl: s.avatar_url, order: s.order_index }));
  },
  saveStaff: async (s: any) => supabase.from('staff_members').upsert({ id: (s.id && s.id.length > 10) ? s.id : undefined, full_name: s.fullName, position: s.position, party_date: s.partyDate || null, email: s.email, avatar_url: s.avatarUrl, order_index: s.order }),
  deleteStaff: async (id: string) => supabase.from('staff_members').delete().eq('id', id),
  getMenu: async () => {
      const { data } = await supabase.from('menu_items').select('*').order('order_index');
      return (data || []).map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
  },
  saveMenu: async (items: any[]) => { for (const m of items) await supabase.from('menu_items').upsert({ id: (m.id && m.id.includes('-')) ? m.id : undefined, label: m.label, path: m.path, order_index: m.order }); },
  deleteMenu: async (id: string) => supabase.from('menu_items').delete().eq('id', id),
  getAlbums: async () => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
  },
  saveAlbum: async (a: any) => supabase.from('gallery_albums').upsert({ id: (a.id && a.id.length > 10) ? a.id : undefined, title: a.title, description: a.description, thumbnail: a.thumbnail, created_date: a.createdDate }),
  deleteAlbum: async (id: string) => supabase.from('gallery_albums').delete().eq('id', id),
  getGallery: async () => {
     const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
     return (data || []).map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
  },
  saveImage: async (img: any) => supabase.from('gallery_images').insert({ url: img.url, caption: img.caption, album_id: img.albumId }),
  deleteImage: async (id: string) => supabase.from('gallery_images').delete().eq('id', id),
  getVideos: async () => {
    const { data } = await supabase.from('videos').select('*').order('order_index');
    return (data || []).map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, order: v.order_index }));
  },
  saveVideo: async (v: any) => supabase.from('videos').upsert({ id: (v.id && v.id.length > 10) ? v.id : undefined, title: v.title, youtube_url: v.youtubeUrl, order_index: v.order }),
  deleteVideo: async (id: string) => supabase.from('videos').delete().eq('id', id),
  getIntroductions: async () => {
    const { data } = await supabase.from('school_introductions').select('*').order('order_index');
    return (data || []).map((i: any) => ({ id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible }));
  },
  saveIntroduction: async (i: any) => supabase.from('school_introductions').upsert({ id: (i.id && i.id.length > 10) ? i.id : undefined, title: i.title, slug: i.slug, content: i.content, image_url: i.image_url, order_index: i.order, is_visible: i.isVisible }),
  deleteIntroduction: async (id: string) => supabase.from('school_introductions').delete().eq('id', id),
  getUsers: async () => {
    const { data } = await supabase.from('user_profiles').select('*');
    return (data || []).map(u => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role, email: u.email, avatarUrl: u.avatar_url }));
  },
  saveUser: async (u: any) => supabase.from('user_profiles').upsert({ id: (u.id && u.id.length > 10) ? u.id : undefined, full_name: u.fullName, username: u.username, role: u.role, email: u.email, avatar_url: u.avatar_url }),
  deleteUser: async (id: string) => supabase.from('user_profiles').delete().eq('id', id),
};
