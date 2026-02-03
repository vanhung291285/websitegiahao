
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU ĐẦY ĐỦ CHO DỰ ÁN: webtruonghoc
-- Copy toàn bộ nội dung này vào Supabase SQL Editor và nhấn RUN

-- 0. Tiện ích mở rộng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng cấu hình trường học
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'Trường học của bạn',
  slogan TEXT DEFAULT 'Chất lượng - Hiệu quả - Thành công',
  logo_url TEXT,
  favicon_url TEXT,
  banner_url TEXT,
  principal_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  hotline TEXT,
  map_url TEXT,
  facebook TEXT,
  youtube TEXT,
  zalo TEXT,
  website TEXT,
  show_welcome_banner BOOLEAN DEFAULT true,
  home_news_count INTEGER DEFAULT 6,
  home_show_program BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#1e3a8a',
  title_color TEXT DEFAULT '#fbbf24',
  title_shadow_color TEXT DEFAULT 'rgba(0,0,0,0.8)',
  meta_title TEXT,
  meta_description TEXT,
  footer_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Categories dùng chung
CREATE TYPE module_type AS ENUM ('news', 'documents', 'files');

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  module_type module_type NOT NULL DEFAULT 'news',
  parent_id UUID REFERENCES categories(id),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, module_type)
);

-- 3. Bảng Bài viết
-- CẬP NHẬT: date chuyển sang TIMESTAMPTZ để lưu giờ phút
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  thumbnail TEXT,
  image_caption TEXT,
  author TEXT,
  date TIMESTAMPTZ DEFAULT NOW(), 
  category TEXT, -- Slug của category
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT true,
  block_ids JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Văn bản - Tài liệu
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES categories(id),
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Cán bộ giáo viên
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date DATE,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Video
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Thư viện ảnh
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption TEXT,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bảng Khối hiển thị (Blocks)
CREATE TABLE IF NOT EXISTS display_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- main | sidebar
  type TEXT NOT NULL, -- grid | list | hero | video | etc
  order_index INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 5,
  is_visible BOOLEAN DEFAULT true,
  html_content TEXT,
  target_page TEXT DEFAULT 'all',
  custom_color TEXT,
  custom_text_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Bảng Menu
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Bảng Giới thiệu nhà trường
CREATE TABLE IF NOT EXISTS school_introductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Thống kê truy cập
CREATE TABLE IF NOT EXISTS site_counters (
  key TEXT PRIMARY KEY,
  value BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visitor_logs (
  session_id TEXT PRIMARY KEY,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- BẬT RLS (ROW LEVEL SECURITY) VÀ TẠO POLICIES
ALTER TABLE school_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON school_config FOR SELECT USING (true);
CREATE POLICY "Admin write" ON school_config FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin write" ON categories FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON posts FOR SELECT USING (true);
CREATE POLICY "Admin write" ON posts FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON documents FOR SELECT USING (true);
CREATE POLICY "Admin write" ON documents FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Admin write" ON staff_members FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON videos FOR SELECT USING (true);
CREATE POLICY "Admin write" ON videos FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON gallery_albums FOR SELECT USING (true);
CREATE POLICY "Admin write" ON gallery_albums FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin write" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE display_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON display_blocks FOR SELECT USING (true);
CREATE POLICY "Admin write" ON display_blocks FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin write" ON menu_items FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE school_introductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON school_introductions FOR SELECT USING (true);
CREATE POLICY "Admin write" ON school_introductions FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all" ON visitor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON visitor_logs FOR UPDATE USING (true);
CREATE POLICY "Enable select for admin" ON visitor_logs FOR SELECT USING (true);

-- DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO site_counters (key, value) VALUES ('total_visits', 1500), ('today_visits', 45), ('month_visits', 1200) ON CONFLICT (key) DO NOTHING;
INSERT INTO school_config (name, slogan) VALUES ('Trường học mới của tôi', 'Nâng tầm tri thức Việt') ON CONFLICT DO NOTHING;
INSERT INTO menu_items (label, path, order_index) VALUES ('Trang chủ', 'home', 1), ('Giới thiệu', 'intro', 2), ('Tin tức', 'news', 3) ON CONFLICT DO NOTHING;
