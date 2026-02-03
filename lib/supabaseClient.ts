import { createClient } from '@supabase/supabase-js';

// CẤU HÌNH SUPABASE
// Trong môi trường Next.js thực tế, hãy sử dụng process.env.NEXT_PUBLIC_SUPABASE_URL
// Để demo hoạt động ngay, bạn có thể điền trực tiếp hoặc đảm bảo biến môi trường đã được set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper để lấy URL ảnh public
export const getStorageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${supabaseUrl}/storage/v1/object/public/school-assets/${path}`;
};