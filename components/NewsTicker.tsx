
import React from 'react';
import { Post } from '../types';
import { Bell } from 'lucide-react';

interface NewsTickerProps {
  posts: Post[];
  onNavigate: (path: string, id?: string) => void;
  primaryColor?: string;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ posts, onNavigate, primaryColor = '#1e3a8a' }) => {
  
  const formatDateOnly = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (e) { return dateStr; }
  };

  const latestPosts = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (latestPosts.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm overflow-hidden h-10 flex items-center">
      <div className="marquee-container flex-1 h-full flex items-center bg-blue-50/30">
        <div className="marquee-content flex items-center">
          {latestPosts.map((post, idx) => (
            <button
              key={post.id}
              onClick={() => onNavigate('news-detail', post.id)}
              className="inline-flex items-center mx-10 text-[15px] font-bold text-[#1e3a8a] hover:text-red-700 transition-colors group"
            >
              <Bell size={14} className="mr-2 text-red-600 animate-pulse" />
              <span>{post.title}</span>
              <span className="ml-2 text-[11px] text-gray-500 font-normal italic">({formatDateOnly(post.date)})</span>
              {idx < latestPosts.length - 1 && (
                <span className="ml-10 text-gray-300 font-light">|</span>
              )}
            </button>
          ))}
          
          {latestPosts.map((post) => (
            <button
              key={`${post.id}-clone`}
              onClick={() => onNavigate('news-detail', post.id)}
              className="inline-flex items-center mx-10 text-[15px] font-bold text-[#1e3a8a] hover:text-red-700 transition-colors group"
            >
              <Bell size={14} className="mr-2 text-red-600 animate-pulse" />
              <span>{post.title}</span>
              <span className="ml-2 text-[11px] text-gray-500 font-normal italic">({formatDateOnly(post.date)})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
