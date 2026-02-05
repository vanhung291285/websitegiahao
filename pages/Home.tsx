
import React from 'react';
import { Post, SchoolConfig, GalleryImage, DisplayBlock, IntroductionArticle, PostCategory, Video, DocumentCategory, StaffMember, SchoolDocument } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChevronRight, Calendar, ImageIcon, ArrowRight, Star, Clock, FileText, Eye, Download, User, Mail, Briefcase } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  postCategories: PostCategory[]; 
  docCategories: DocumentCategory[];
  documents: SchoolDocument[];
  staffList: StaffMember[];
  config: SchoolConfig;
  gallery: GalleryImage[];
  videos?: Video[];
  blocks: DisplayBlock[];
  introductions?: IntroductionArticle[]; 
  onNavigate: (path: string, id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ 
    posts = [], 
    postCategories = [], 
    docCategories = [], 
    documents = [], 
    staffList = [], 
    config, 
    gallery = [], 
    videos = [], 
    blocks = [], 
    introductions = [], 
    onNavigate 
}) => {
  
  // CẬP NHẬT: Chỉ hiển thị ngày, không hiển thị giờ
  const formatVNTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getPostsForBlock = (block: DisplayBlock, overrideCount?: number) => {
    let filtered = posts.filter(p => p.status === 'published');
    const source = block.htmlContent || 'all'; 

    if (source === 'featured') {
         filtered = filtered.filter(p => p.isFeatured);
    } 
    else if (source !== 'all') {
        filtered = filtered.filter(p => p.category === source);
    }
    
    return filtered
      .sort((a, b) => {
          if (b.date > a.date) return 1;
          if (b.date < a.date) return -1;
          return 0;
      })
      .slice(0, overrideCount || block.itemCount || 5);
  };

  const getCategoryBadge = (catSlug: string) => {
    const cat = postCategories.find(c => c.slug === catSlug);
    if (cat) {
        return { text: cat.name.toUpperCase(), color: `bg-${cat.color}-600` };
    }
    return { text: 'TIN TỨC', color: 'bg-blue-600' };
  };

  const renderBlock = (block: DisplayBlock) => {
    if (block.targetPage === 'detail') return null;
    if (block.type === 'hero' && !config.showWelcomeBanner) return null;
    
    if (block.type === 'html') {
        return <div key={block.id} className="mb-10" dangerouslySetInnerHTML={{ __html: block.htmlContent || '' }} />;
    }

    // Special handling for Hero to ensure we get 8 items (1 main + 7 subs) regardless of block setting
    const blockPosts = block.type === 'hero' 
        ? getPostsForBlock(block, 8) 
        : getPostsForBlock(block);

    const isDocs = block.type === 'docs';
    const isStaff = block.type === 'staff';
    
    if (!isDocs && !isStaff && blockPosts.length === 0 && !['video', 'stats'].includes(block.type)) return null;

    const accentColor = block.customColor || '#1e3a8a';
    const textColor = block.customTextColor || '#1e3a8a';

    const BlockHeader = () => (
        <div className="flex flex-col mb-8">
            <div className="flex justify-between items-center pb-2">
                <div className="flex items-center">
                    <div className="w-1.5 h-7 mr-3.5 rounded-sm" style={{ backgroundColor: accentColor }}></div>
                    <h3 className="text-[20px] md:text-[22px] font-black uppercase tracking-tighter" style={{ color: textColor }}>
                        {block.name}
                    </h3>
                </div>
                <button 
                    onClick={() => onNavigate(isDocs ? 'documents' : (isStaff ? 'staff' : 'news'))} 
                    className="group px-5 py-1.5 rounded-full text-[13px] font-bold uppercase flex items-center transition-all shadow-sm border border-transparent hover:border-gray-200"
                    style={{ backgroundColor: `${accentColor}0a`, color: accentColor }}
                >
                    XEM TẤT CẢ <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="w-full h-1" style={{ backgroundColor: accentColor }}></div>
        </div>
    );

    if (isDocs) {
        const latestDocs = [...documents].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, block.itemCount || 5);
        return (
            <section key={block.id} className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <BlockHeader />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <tbody className="divide-y divide-gray-100">
                            {latestDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-blue-50 transition-colors group">
                                    <td className="py-5 px-4 w-40 font-bold text-blue-900 text-[16px] border-r border-gray-50">Số: {doc.number}</td>
                                    <td className="py-5 px-6 w-32 text-gray-500 font-bold text-[15px] border-r border-gray-50">{doc.date}</td>
                                    <td className="py-5 px-6 text-gray-800 font-black text-[18px] group-hover:text-blue-700 transition cursor-pointer" onClick={() => onNavigate('documents')}>{doc.title}</td>
                                    <td className="py-5 px-4 w-24 text-right">
                                        <div className="flex gap-3 justify-end">
                                            <Eye size={20} className="text-blue-500 cursor-pointer hover:scale-110 transition" onClick={() => onNavigate('documents')} />
                                            <Download size={20} className="text-green-600 cursor-pointer hover:scale-110 transition" onClick={() => window.open(doc.downloadUrl, '_blank')} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    if (isStaff) {
        const topStaff = [...staffList].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, block.itemCount || 5);
        return (
            <section key={block.id} className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <BlockHeader />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[13px] font-black uppercase text-gray-400 border-b">
                                <th className="py-4 px-6 text-left w-20">Ảnh</th>
                                <th className="py-4 px-6 text-left">Họ và Tên</th>
                                <th className="py-4 px-6 text-left">Chức vụ / Thông tin</th>
                                <th className="py-4 px-6 text-right w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 group-hover:scale-110 transition-transform">
                                            {staff.avatarUrl ? <img src={staff.avatarUrl} alt={staff.fullName} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={24}/></div>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-[18px] font-black text-gray-900 group-hover:text-blue-800 transition">{staff.fullName}</div>
                                        <div className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mt-1">SST: {staff.order}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center text-[15px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit">
                                                <Briefcase size={14} className="mr-2"/> {staff.position}
                                            </span>
                                            {staff.email && <span className="text-[14px] text-gray-500 flex items-center mt-1 italic"><Mail size={14} className="mr-2 text-gray-400"/> {staff.email}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => onNavigate('staff')} className="text-gray-300 group-hover:text-blue-600 transition"><ArrowRight size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    if (block.type === 'hero') {
        const mainHero = blockPosts[0]; 
        const subHeros = blockPosts.slice(1, 8); // Get next 7 items
        if (!mainHero) return null;

        return (
          <section key={block.id} className="mb-10 font-sans">
             <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200">
                 {/* Tiêu đề khối */}
                 <div className="flex items-center justify-between mb-5 border-b-2 border-red-600 pb-2">
                    <h2 className="text-red-700 font-bold text-lg uppercase flex items-center tracking-tight">
                        <Star size={20} className="mr-2 fill-red-600 text-red-600" />
                        TIN TIÊU ĐIỂM
                    </h2>
                    <button 
                        onClick={() => onNavigate('news')} 
                        className="text-xs text-gray-500 hover:text-red-600 font-bold flex items-center"
                    >
                        Xem thêm <ChevronRight size={14}/>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main News - Left Column */}
                    <div className="lg:col-span-7 group cursor-pointer" onClick={() => onNavigate('news-detail', mainHero.id)}>
                        <div className="relative overflow-hidden rounded-lg mb-4 shadow-sm border border-gray-100">
                            <img 
                                src={mainHero.thumbnail} 
                                alt={mainHero.title} 
                                className="w-full h-[300px] md:h-[420px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Category Label Overlay */}
                            <div className="absolute top-4 left-4">
                                <span className={`text-white text-[10px] font-black px-3 py-1 uppercase rounded shadow-lg ${getCategoryBadge(mainHero.category).color}`}>
                                    {mainHero.category === 'news' ? 'TIN TỨC' : 'SỰ KIỆN'}
                                </span>
                            </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-blue-900 leading-snug mb-3 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                            {mainHero.title}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-[15px] line-clamp-3 leading-relaxed text-justify">
                            {mainHero.summary}
                        </p>
                        <div className="mt-3 flex items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <Clock size={12} className="mr-1.5"/> {formatVNTime(mainHero.date)}
                        </div>
                    </div>

                    {/* Side List (7 items) - Right Column */}
                    <div className="lg:col-span-5">
                        <div className="flex flex-col h-full">
                            {subHeros.map((sub, index) => (
                                <div 
                                    key={sub.id} 
                                    onClick={() => onNavigate('news-detail', sub.id)}
                                    className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                    <div className="w-28 h-20 shrink-0 overflow-hidden rounded-md shadow-sm border border-gray-200 relative">
                                        <img 
                                            src={sub.thumbnail} 
                                            alt={sub.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-[13px] md:text-[14px] font-bold text-gray-800 leading-snug group-hover:text-blue-700 line-clamp-2 mb-1.5 uppercase tracking-tight">
                                            {sub.title}
                                        </h4>
                                        <div className="flex items-center text-[10px] text-gray-400 font-medium">
                                            <Calendar size={10} className="mr-1"/> {formatVNTime(sub.date)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {subHeros.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm italic">
                                    Đang cập nhật thêm tin tức...
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
             </div>
          </section>
        );
    }

    if (block.type === 'grid') {
        return (
          <section key={block.id} className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <BlockHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {blockPosts.map((post) => {
                   const badge = getCategoryBadge(post.category);
                   return (
                   <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full bg-white rounded-xl hover:translate-y-[-5px] transition-all duration-300">
                       <div className="relative overflow-hidden rounded-xl mb-4 h-48 border border-gray-100 shadow-md bg-gray-50">
                           <img src={post.thumbnail} className="w-full h-full object-cover brightness-110 transform group-hover:scale-110 transition duration-700" alt="" loading="lazy" />
                           <div className={`absolute top-3 left-3 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xl ${badge.color}`}>{badge.text}</div>
                       </div>
                       <h4 className="font-black text-gray-900 text-[16px] leading-[1.4] mb-3 group-hover:text-blue-800 transition line-clamp-3 uppercase tracking-tight">{post.title}</h4>
                       <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow leading-relaxed italic">{post.summary}</p>
                       <div className="text-[10px] text-gray-400 font-bold flex items-center border-t border-gray-50 pt-3 mt-auto uppercase tracking-widest">
                           <Calendar size={12} className="mr-2 text-blue-500"/> {formatVNTime(post.date)}
                       </div>
                   </div>
                   );
               })}
            </div>
          </section>
        );
    }

    if (block.type === 'highlight' || block.type === 'list') {
         return (
            <section key={block.id} className="mb-12">
               <BlockHeader />
               <div className="bg-white p-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {blockPosts.map(post => (
                           <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="flex gap-5 group cursor-pointer hover:bg-slate-50/50 p-3 rounded-xl transition-all border border-transparent">
                               <div className="w-28 h-20 shrink-0 overflow-hidden rounded-lg shadow-md border border-gray-100 bg-gray-50">
                                  <img src={post.thumbnail} className="w-full h-full object-cover brightness-110 transform group-hover:scale-110 transition duration-700" alt="" loading="lazy" />
                               </div>
                               <div className="flex-1">
                                   <h4 className="text-[15px] font-black text-gray-800 leading-snug mb-2 group-hover:text-teal-800 line-clamp-2 uppercase tracking-tight">{post.title}</h4>
                                   <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                                       <Calendar size={10} className="mr-1.5"/> {formatVNTime(post.date)}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </section>
         );
    }
    return null;
  };

  const mainBlocks = blocks.filter(b => b.position === 'main');
  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="pb-16 bg-slate-50 font-sans">
      <div className="container mx-auto px-4 mt-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
               {mainBlocks.length > 0 ? mainBlocks.map(block => renderBlock(block)) : (
                 <div className="bg-white p-24 text-center rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-xl italic font-black uppercase opacity-40 tracking-widest">Nội dung đang được cập nhật...</p>
                 </div>
               )}
            </div>
            <div className="lg:col-span-4 space-y-10">
               <Sidebar blocks={sidebarBlocks} posts={posts} postCategories={postCategories} docCategories={docCategories} documents={documents} videos={videos} onNavigate={onNavigate} currentPage="home" />
            </div>
         </div>
      </div>
    </div>
  );
};
