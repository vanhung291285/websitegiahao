
import React, { useState } from 'react';
import { useStore } from '../../store/mockSupabase';
import { Post } from '../../types';
import { generateSchoolContent } from '../../services/geminiService';
import { Edit, Trash2, Plus, Sparkles, Loader2, Save, X } from 'lucide-react';

const PostManager = () => {
  const { posts, addPost, updatePost, deletePost } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Form Handlers
  const handleOpenCreate = () => {
    setCurrentPost({
      title: '',
      slug: '',
      // Fixed: PostCategory is an interface, use literal string for demo
      category: 'news',
      // Fixed: excerpt to summary
      summary: '',
      content: '',
      // Fixed: image_url to thumbnail
      thumbnail: 'https://picsum.photos/800/600',
      author: 'Admin',
      status: 'published'
    });
    setIsEditing(true);
  };

  const handleEdit = (post: Post) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPost.id) {
      updatePost(currentPost.id, currentPost);
    } else {
      addPost(currentPost as any);
    }
    setIsEditing(false);
  };

  const handleGenerateAI = async () => {
    if (!currentPost.title) {
      alert("Vui lòng nhập tiêu đề để AI có thể hiểu ngữ cảnh.");
      return;
    }
    setIsGenerating(true);
    const content = await generateSchoolContent(
      currentPost.title, 
      // Fixed: 'article' is not valid, use 'news'
      currentPost.category === 'announcement' ? 'announcement' : 'news'
    );
    setCurrentPost(prev => ({ 
      ...prev, 
      content: content,
      // Fixed: excerpt to summary
      summary: content.substring(0, 150) + "..." 
    }));
    setIsGenerating(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{currentPost.id ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-red-500"><X /></button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input 
                  required
                  type="text" 
                  value={currentPost.title} 
                  onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Chuyên mục</label>
                   <select 
                     value={currentPost.category} 
                     onChange={e => setCurrentPost({...currentPost, category: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded"
                   >
                     {/* Fixed: Use literal strings for demo categories */}
                     <option value="news">Tin tức</option>
                     <option value="announcement">Thông báo</option>
                     <option value="activity">Hoạt động</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tác giả</label>
                   <input 
                      type="text" 
                      value={currentPost.author}
                      onChange={e => setCurrentPost({...currentPost, author: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded"
                   />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt</label>
                <textarea 
                  // Fixed: excerpt to summary
                  value={currentPost.summary} 
                  onChange={e => setCurrentPost({...currentPost, summary: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded h-24"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện (URL)</label>
                 <input 
                    type="text" 
                    // Fixed: image_url to thumbnail
                    value={currentPost.thumbnail}
                    onChange={e => setCurrentPost({...currentPost, thumbnail: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm text-slate-500"
                 />
                 {currentPost.thumbnail && (
                   <img src={currentPost.thumbnail} alt="Preview" className="mt-2 w-full h-40 object-cover rounded bg-slate-100" />
                 )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-slate-700">Nội dung chi tiết</label>
               <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition disabled:opacity-50"
               >
                 {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                 Viết nội dung bằng AI (Gemini)
               </button>
            </div>
            <textarea 
              required
              value={currentPost.content}
              onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
              className="w-full p-4 border border-slate-300 rounded h-64 font-mono text-sm"
              placeholder="Nội dung bài viết (Hỗ trợ Markdown)..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm">
              <Save size={18} /> Lưu bài viết
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý bài viết</h2>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm">
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Tiêu đề</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Chuyên mục</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Ngày tạo</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Lượt xem</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-slate-800 max-w-md truncate">{post.title}</div>
                    <div className="text-xs text-slate-400 mt-1">ID: {post.id}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${post.category === 'news' ? 'bg-blue-100 text-blue-700' : 
                        post.category === 'announcement' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {post.category}
                    </span>
                  </td>
                  {/* Fixed: created_at to date */}
                  <td className="p-4 text-sm text-slate-600">{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-sm text-slate-600">{post.views}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(post)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deletePost(post.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PostManager;
