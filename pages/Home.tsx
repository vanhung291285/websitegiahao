
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

  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    const source = block.htmlContent || 'all'; 

    if (source === 'featured' || block.type === 'hero') {
        // Lấy tất cả và sắp xếp theo ngày mới nhất
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
      .slice(0, block.itemCount || 5);
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

    const blockPosts = getPostsForBlock(block);
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
        const subHeros = blockPosts.slice(1, 3);
        if (!mainHero) return null;
        return (
          <section key={block.id} className="mb-10">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-2 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <div className="md:col-span-8 relative h-[400px] md:h-[520px] group cursor-pointer overflow-hidden bg-gray-900" onClick={() => onNavigate('news-detail', mainHero.id)}>
                    <img src={mainHero.thumbnail} alt={mainHero.title} className="w-full h-full object-cover opacity-100 brightness-110 group-hover:scale-105 transition-all duration-1000"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                        <span className={`text-white text-[11px] font-black px-4 py-1.5 uppercase rounded-full mb-5 inline-block shadow-lg ${getCategoryBadge(mainHero.category).color}`}>
                            {mainHero.isFeatured ? 'TIN TIÊU ĐIỂM' : 'BÀI MỚI NHẤT'}
                        </span>
                        <h2 className="text-white text-xl md:text-2xl lg:text-[30px] font-black leading-tight mb-5 group-hover:text-yellow-400 transition-colors drop-shadow-2xl line-clamp-3 uppercase tracking-tighter">
                            {mainHero.title}
                        </h2>
                        <p className="text-gray-200 text-[15px] line-clamp-2 mb-5 opacity-100 max-w-3xl font-medium leading-relaxed drop-shadow-md">{mainHero.summary}</p>
                        <div className="flex items-center text-gray-300 text-[12px] gap-4 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                <Calendar size={14} className="text-yellow-400"/> {formatVNTime(mainHero.date)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-4 flex flex-col gap-2 h-[300px] md:h-[520px]">
                    {subHeros.map(sub => (
                        <div key={sub.id} className="relative flex-1 group cursor-pointer overflow-hidden bg-gray-900" onClick={() => onNavigate('news-detail', sub.id)}>
                            <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-cover opacity-100 brightness-110 group-hover:scale-110 transition-all duration-1000" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-5 w-full">
                                <div className="text-[10px] text-yellow-400 font-bold mb-1 flex items-center gap-2">
                                    <span>{formatVNTime(sub.date)}</span>
                                </div>
                                <h3 className="text-white text-[15px] font-black leading-snug group-hover:text-yellow-400 transition-colors drop-shadow-lg line-clamp-3 uppercase">{sub.title}</h3>
                            </div>
                        </div>
                    ))}
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
