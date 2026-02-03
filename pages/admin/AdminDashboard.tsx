
import React from 'react';
import { useStore } from '../../store/mockSupabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, FileText, Users, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { posts, stats } = useStore();

  const totalViews = posts.reduce((acc, curr) => acc + curr.views, 0);
  
  // Prepare data for chart (Views by Category)
  const viewsByCategory = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + post.views;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(viewsByCategory).map(key => ({
    name: key,
    views: viewsByCategory[key]
  }));

  const StatBox = ({ label, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          {icon}
        </div>
        <span className="text-green-500 text-xs font-bold">+2.5%</span>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox label="Tổng lượt xem" value={totalViews.toLocaleString()} icon={<Eye size={24} className="text-blue-600" />} color="bg-blue-600" />
        <StatBox label="Bài viết" value={posts.length} icon={<FileText size={24} className="text-purple-600" />} color="bg-purple-600" />
        <StatBox label="Học sinh" value={stats.students} icon={<Users size={24} className="text-orange-600" />} color="bg-orange-600" />
        <StatBox label="Truy cập realtime" value="45" icon={<Activity size={24} className="text-green-600" />} color="bg-green-600" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Thống kê truy cập theo chuyên mục</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Bài viết mới nhất</h3>
          <div className="space-y-4">
            {posts.slice(0, 5).map(post => (
              <div key={post.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 line-clamp-1">{post.title}</h4>
                  {/* Fixed: created_at to date */}
                  <p className="text-xs text-slate-500">{new Date(post.date).toLocaleDateString('vi-VN')} • {post.views} xem</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
