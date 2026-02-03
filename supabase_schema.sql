-- CHẠY SCRIPT NÀY TRONG SUPABASE SQL EDITOR --
-- Region: Singapore (ap-southeast-1) để tối ưu tốc độ cho Việt Nam --

-- 1. Tạo bảng Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  author text default 'Admin',
  category text not null, -- 'Tin tức', 'Thông báo', ...
  views bigint default 0,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tạo Enum và Bảng Categories (NEW)
create type public.module_type as enum ('news', 'documents', 'files');

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  module_type public.module_type not null default 'news',
  parent_id uuid references public.categories(id),
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Đảm bảo slug là duy nhất trong cùng một module
  unique (slug, module_type)
);

-- 3. Bật Row Level Security (RLS)
alter table public.posts enable row level security;
alter table public.categories enable row level security;

-- 4. Policies cho Posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using ( true );

create policy "Admins can insert posts"
  on public.posts for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update posts"
  on public.posts for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete posts"
  on public.posts for delete
  using ( auth.role() = 'authenticated' );

-- 5. Policies cho Categories (NEW)
create policy "Public categories are viewable by everyone"
  on public.categories for select
  using ( true );

create policy "Admins can manage categories"
  on public.categories for all
  using ( auth.role() = 'authenticated' );

-- 6. Tạo Storage Bucket cho ảnh (Optional)
insert into storage.buckets (id, name, public) 
values ('school-assets', 'school-assets', true);

create policy "Public Access to Images"
  on storage.objects for select
  using ( bucket_id = 'school-assets' );

create policy "Auth users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'school-assets' and auth.role() = 'authenticated' );

-- DATA MẪU --
insert into public.posts (title, slug, excerpt, content, category, author, image_url)
values 
('Chào mừng năm học mới 2024 tại EduViet', 'chao-mung-2024', 'Không khí tưng bừng ngày tựu trường.', 'Nội dung chi tiết...', 'Hoạt động', 'Ban Giám Hiệu', 'https://picsum.photos/seed/1/800/600'),
('Thông báo tuyển sinh lớp 10', 'tuyen-sinh-10', 'Chỉ tiêu 500 học sinh.', 'Chi tiết hồ sơ...', 'Tuyển sinh', 'Phòng Đào Tạo', 'https://picsum.photos/seed/2/800/600');

insert into public.categories (name, slug, module_type, display_order)
values
('Tin tức chung', 'tin-tuc-chung', 'news', 1),
('Thông báo nhà trường', 'thong-bao', 'news', 2),
('Văn bản hành chính', 'van-ban-hanh-chinh', 'documents', 1),
('Tài liệu học tập', 'tai-lieu-hoc-tap', 'files', 1);
