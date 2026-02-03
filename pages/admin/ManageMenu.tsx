
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { DatabaseService } from '../../services/database';
import { List, Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Loader2 } from 'lucide-react';

interface ManageMenuProps {
   refreshData: (showLoader?: boolean) => void;
}

export const ManageMenu: React.FC<ManageMenuProps> = ({ refreshData }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for new item
  const [newLabel, setNewLabel] = useState('');
  const [newPathType, setNewPathType] = useState<'internal' | 'external'>('internal');
  const [newPath, setNewPath] = useState('home');
  const [newExternalUrl, setNewExternalUrl] = useState('');

  useEffect(() => {
     loadMenu();
  }, []);

  const loadMenu = async () => {
      setIsLoading(true);
      const items = await DatabaseService.getMenu();
      setMenuItems(items.sort((a,b) => a.order - b.order));
      setIsLoading(false);
  };

  const systemPaths = [
     { label: 'Trang chủ', path: 'home' },
     { label: 'Giới thiệu', path: 'intro' },
     { label: 'Đội ngũ Giáo viên', path: 'staff' }, 
     { label: 'Tin tức & Sự kiện', path: 'news' },
     { label: 'Văn bản - Hồ sơ', path: 'documents' },
     { label: 'Tài liệu học tập', path: 'resources' },
     { label: 'Thư viện ảnh', path: 'gallery' },
     { label: 'Liên hệ', path: 'contact' },
  ];

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
        await DatabaseService.saveMenu(menuItems);
        await loadMenu(); 
        refreshData(false); 
        alert("Đã cập nhật Menu thành công!");
    } catch (e) {
        alert("Lỗi khi cập nhật");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAdd = async () => {
     if (!newLabel) return alert("Vui lòng nhập tên Menu");
     
     const path = newPathType === 'internal' ? newPath : newExternalUrl;
     if (!path) return alert("Vui lòng nhập/chọn đường dẫn");

     setIsSubmitting(true);
     try {
         const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.order)) : 0;
         const newItem: MenuItem = {
            id: '', // Để trống ID để Supabase tự sinh UUID
            label: newLabel,
            path: path,
            order: maxOrder + 1
         };

         // Lưu trực tiếp một item mới
         await DatabaseService.saveMenu([newItem]);
         
         setNewLabel('');
         setNewExternalUrl('');
         await loadMenu(); 
         refreshData(false);
         alert("Đã thêm Menu mới thành công!");
     } catch (e) {
         alert("Không thể thêm Menu");
     } finally {
         setIsSubmitting(false);
     }
  };

  const handleDelete = async (id: string) => {
     if (!id.includes('-')) return alert("ID không hợp lệ để xóa");
     if (confirm("Bạn có chắc chắn muốn xóa menu này?")) {
        await DatabaseService.deleteMenu(id);
        await loadMenu();
        refreshData(false);
     }
  };

  const handleChange = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === menuItems.length - 1) return;

      const newItems = [...menuItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      
      const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      setMenuItems(reordered);
      
      await DatabaseService.saveMenu(reordered);
      refreshData(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* CỘT TRÁI: THÊM MENU MỚI - GIỐNG HÌNH GỐC */}
         <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
               <h3 className="font-black text-[#0d4d44] mb-6 flex items-center border-b pb-4 text-lg">
                  <Plus size={22} className="mr-2 text-[#00a38d]"/> Thêm Menu Mới
               </h3>
               
               <div className="space-y-5">
                  <div>
                     <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-tight">Tên hiển thị</label>
                     <input 
                       type="text" 
                       className="w-full border border-gray-200 rounded-md p-3 text-sm bg-gray-50 focus:bg-white outline-none font-medium placeholder:text-gray-300"
                       placeholder="VD: Tuyển sinh"
                       value={newLabel}
                       onChange={e => setNewLabel(e.target.value)}
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-tight">Loại liên kết</label>
                     <div className="flex gap-6 items-center">
                        <label className="flex items-center cursor-pointer group">
                           <input 
                              type="radio" 
                              name="pathType" 
                              className="w-4 h-4 text-[#00a38d] focus:ring-[#00a38d] mr-2"
                              checked={newPathType === 'internal'}
                              onChange={() => setNewPathType('internal')}
                           />
                           <span className="text-sm font-bold text-gray-700">Trang trong hệ thống</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                           <input 
                              type="radio" 
                              name="pathType" 
                              className="w-4 h-4 text-[#00a38d] focus:ring-[#00a38d] mr-2"
                              checked={newPathType === 'external'}
                              onChange={() => setNewPathType('external')}
                           />
                           <span className="text-sm font-bold text-gray-700">Liên kết ngoài</span>
                        </label>
                     </div>
                  </div>

                  {newPathType === 'internal' ? (
                     <div>
                        <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-tight">Chọn trang đích</label>
                        <select 
                           className="w-full border border-gray-200 rounded-md p-3 text-sm bg-gray-50 font-bold outline-none"
                           value={newPath}
                           onChange={e => setNewPath(e.target.value)}
                        >
                           {systemPaths.map(p => (
                              <option key={p.path} value={p.path}>{p.label}</option>
                           ))}
                        </select>
                     </div>
                  ) : (
                     <div>
                        <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-tight">Đường dẫn (URL)</label>
                        <input 
                           type="text" 
                           className="w-full border border-gray-200 rounded-md p-3 text-sm bg-gray-50 outline-none font-mono"
                           placeholder="https://..."
                           value={newExternalUrl}
                           onChange={e => setNewExternalUrl(e.target.value)}
                        />
                     </div>
                  )}

                  <button 
                     onClick={handleAdd}
                     disabled={isSubmitting}
                     className="w-full bg-[#00897b] text-white font-black py-4 rounded-md hover:bg-[#00796b] transition-all shadow-md uppercase text-base flex items-center justify-center active:scale-95 disabled:opacity-50"
                  >
                     {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                     Thêm và Lưu
                  </button>
               </div>
            </div>
         </div>

         {/* CỘT PHẢI: DANH SÁCH MENU HIỆN TẠI - GIỐNG HÌNH GỐC */}
         <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="font-black text-[#0d4d44] flex items-center text-lg">
                     <List size={22} className="mr-2 text-[#00a38d]"/> Cấu trúc Menu hiện tại
                  </h3>
                  <button 
                    onClick={handleSaveAll} 
                    disabled={isSubmitting}
                    className="bg-[#2e5cd0] text-white px-6 py-2.5 rounded-md font-black flex items-center hover:bg-[#214bc1] text-xs shadow-lg uppercase transition-all active:scale-95 disabled:opacity-50"
                  >
                     <Save size={18} className="mr-2" /> Cập nhật tên/link
                  </button>
               </div>

               {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <Loader2 className="animate-spin text-blue-600 mb-2" size={32}/>
                        <p className="text-gray-400 font-bold italic">Đang tải dữ liệu menu...</p>
                    </div>
               ) : (
               <div className="space-y-4">
                  {menuItems.length === 0 && <p className="text-gray-400 italic text-center py-10 font-bold">Chưa có mục menu nào được tạo.</p>}
                  
                  {menuItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-[#f8faff] border border-gray-100 rounded-lg hover:bg-white hover:shadow-md transition-all group">
                       <div className="flex flex-col gap-2">
                          <button onClick={() => moveItem(index, 'up')} className="text-gray-300 hover:text-blue-600 transition"><ArrowUp size={16}/></button>
                          <button onClick={() => moveItem(index, 'down')} className="text-gray-300 hover:text-blue-600 transition"><ArrowDown size={16}/></button>
                       </div>
                       
                       <div className="w-10 h-10 flex items-center justify-center bg-[#ccf4ee] text-[#00a38d] rounded-md font-black text-sm shrink-0">
                          {index + 1}
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            value={item.label} 
                            onChange={e => handleChange(item.id, 'label', e.target.value)}
                            className="w-full border border-gray-200 rounded p-2.5 text-sm font-black text-gray-800 bg-white focus:ring-1 focus:ring-teal-500"
                          />
                          <div className="flex items-center gap-2">
                             <input 
                               type="text" 
                               value={item.path} 
                               onChange={e => handleChange(item.id, 'path', e.target.value)}
                               className="w-full border border-gray-200 rounded p-2.5 text-xs bg-gray-50 text-gray-500 font-mono"
                               title="Đường dẫn đích"
                             />
                          </div>
                       </div>

                       <button 
                            onClick={() => handleDelete(item.id)} 
                            className="text-red-200 hover:text-red-600 p-2.5 hover:bg-red-50 rounded-full transition-all"
                            title="Xóa Menu"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>
                  ))}
               </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
