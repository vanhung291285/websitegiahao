
import React from 'react';
import { useStore } from '../../store/mockSupabase';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Users, BookOpen, Trophy } from 'lucide-react';

const StatCard = ({ icon, count, label }: { icon: React.ReactNode, count: number, label: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-800">{count}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
);

const Home = () => {
  const { posts, stats } = useStore();

  // Fixed: is_published to status === 'published'
  const featuredPost = posts.find(p => p.status === 'published');
  // Fixed: is_published to status === 'published'
  const recentNews = posts.filter(p => p.id !== featuredPost?.id && p.status === 'published').slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full bg-slate-900 overflow-hidden">
        <img 
          src="https://picsum.photos/1920/1080?random=10" 
          alt="School Campus" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container px-4 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-100 text-sm font-semibold mb-4 backdrop-blur-sm">
              Trường Chuẩn Quốc Gia
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Kiến tạo tương lai <br/> Vững bước thành công
            </h1>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-8">
              Môi trường giáo dục hiện đại, năng động, nơi phát huy tối đa tiềm năng của mỗi học sinh.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/admissions" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20">
                Đăng ký tuyển sinh
              </Link>
              <Link to="/about" className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-16 relative z-10 px-4">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users />} count={stats.students} label="Học sinh" />
          <StatCard icon={<Users />} count={stats.teachers} label="Cán bộ giáo viên" />
          <StatCard icon={<BookOpen />} count={stats.classes} label="Lớp học" />
          <StatCard icon={<Trophy />} count={stats.awards} label="Giải thưởng" />
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Tin tức nổi bật</h2>
            <div className="h-1 w-20 bg-blue-600 rounded"></div>
          </div>
          <Link to="/news" className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredPost && (
            <Link to={`/news/${featuredPost.id}`} className="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              {/* Fixed: image_url to thumbnail */}
              <img 
                src={featuredPost.thumbnail} 
                alt={featuredPost.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="inline-block px-2 py-1 bg-blue-600 text-xs font-bold rounded mb-3">
                  {featuredPost.category}
                </span>
                <h3 className="text-2xl font-bold leading-tight mb-2 group-hover:text-blue-200 transition">
                  {featuredPost.title}
                </h3>
                <div className="flex items-center text-slate-300 text-sm gap-4">
                  {/* Fixed: created_at to date */}
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(featuredPost.date).toLocaleDateString('vi-VN')}</span>
                  <span>• {featuredPost.author}</span>
                </div>
              </div>
            </Link>
          )}

          <div className="flex flex-col gap-6">
            {recentNews.map((post) => (
              <Link key={post.id} to={`/news/${post.id}`} className="flex gap-4 group bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden">
                  {/* Fixed: image_url to thumbnail */}
                  <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{post.category}</span>
                    {/* Fixed: created_at to date */}
                    <span className="text-xs text-slate-400">• {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition line-clamp-2">
                    {post.title}
                  </h4>
                  {/* Fixed: excerpt to summary */}
                  <p className="text-sm text-gray-500 mt-2 line-clamp-1">{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Triết lý giáo dục</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-blue-700 rounded-xl hover:bg-blue-800 transition">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-3">Sáng tạo</h3>
              <p className="text-blue-200 text-sm">Khuyến khích tư duy đổi mới, không ngại thử thách và tìm kiếm giải pháp mới.</p>
            </div>
            <div className="p-6 border border-blue-700 rounded-xl hover:bg-blue-800 transition">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3">Trách nhiệm</h3>
              <p className="text-blue-200 text-sm">Sống có trách nhiệm với bản thân, gia đình và cộng đồng xã hội.</p>
            </div>
            <div className="p-6 border border-blue-700 rounded-xl hover:bg-blue-800 transition">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-3">Yêu thương</h3>
              <p className="text-blue-200 text-sm">Xây dựng môi trường học đường thân thiện, nhân ái và tôn trọng lẫn nhau.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
