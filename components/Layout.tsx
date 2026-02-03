
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/mockSupabase';
import { 
  Menu, X, GraduationCap, LayoutDashboard, FileText, Settings, 
  LogOut, Facebook, Phone, Mail, MapPin 
} from 'lucide-react';

export const PublicLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useStore();
  const location = useLocation();

  const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Tin tức', path: '/news' },
    { label: 'Tuyển sinh', path: '/admissions' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-800">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white text-sm py-2 px-4 hidden md:flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone size={14}/> (024) 3838 8888</span>
          <span className="flex items-center gap-1"><Mail size={14}/> contact@eduviet.edu.vn</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-orange-300">Cổng thông tin giáo viên</a>
          <a href="#" className="hover:text-orange-300">Tra cứu điểm</a>
          {isAdmin && <Link to="/admin" className="text-orange-300 font-bold">Vào trang quản trị</Link>}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white">
              <GraduationCap />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-none">EDUVIET</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wider">HIGH SCHOOL</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                  location.pathname === item.path ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
            <div className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-700 font-medium py-2 border-b border-slate-50"
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && <Link to="/admin" className="text-orange-600 font-bold py-2">Quản trị hệ thống</Link>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow bg-slate-50">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <GraduationCap size={24} />
              <span className="text-xl font-bold">EduViet High School</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Ngôi trường của những ước mơ, nơi ươm mầm tài năng và nhân cách cho thế hệ trẻ Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-800 rounded hover:bg-blue-600 transition"><Facebook size={18} /></a>
              <a href="#" className="p-2 bg-slate-800 rounded hover:bg-blue-600 transition"><Mail size={18} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/news" className="hover:text-white transition">Tin tức & Sự kiện</Link></li>
              <li><Link to="/admissions" className="hover:text-white transition">Thông tin tuyển sinh</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Liên hệ công tác</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Đăng nhập quản trị</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><MapPin size={18} className="text-blue-500 shrink-0" /> 123 Đường Xuân Thủy, Cầu Giấy, Hà Nội</li>
              <li className="flex gap-3"><Phone size={18} className="text-blue-500 shrink-0" /> (024) 3838 8888</li>
              <li className="flex gap-3"><Mail size={18} className="text-blue-500 shrink-0" /> info@eduviet.edu.vn</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs text-slate-500">
          © 2024 EduViet High School. All rights reserved. Designed with ❤️ via Gemini.
        </div>
      </footer>
    </div>
  );
};

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { logout, user } = useStore();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/admin' },
    { icon: <FileText size={20} />, label: 'Bài viết', path: '/admin/posts' },
    { icon: <Settings size={20} />, label: 'Cấu hình', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white font-bold text-lg tracking-wide">EduViet CMS</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
               {/* Fixed: avatar_url to avatarUrl */}
               <img src={user?.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              {/* Fixed: user?.name to user?.fullName */}
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white py-2 rounded-md text-sm transition-all"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
