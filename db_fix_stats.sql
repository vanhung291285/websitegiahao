
-- ==============================================================================
-- SCRIPT RESET VÀ CẤU HÌNH THỐNG KÊ (V4 - FIX ONLINE COUNT)
-- Chức năng: 
-- 1. Đặt lại bộ đếm tổng về mức bạn muốn.
-- 2. Xóa dữ liệu Online rác (visitor_logs) để tránh hiển thị sai lệch.
-- 3. Cập nhật ngày reset về định dạng chuẩn số học.
-- Hướng dẫn: Copy toàn bộ vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Xóa dữ liệu thống kê cũ (tránh lỗi logic cũ)
DELETE FROM site_counters;

-- 2. Xóa logs người dùng online (để tránh hiển thị ảo khi reset)
DELETE FROM visitor_logs;

-- 3. Khởi tạo giá trị mới
-- Quan trọng: 'last_reset_date' lưu giá trị số nguyên YYYYMMDD (ví dụ: 20241027)
INSERT INTO site_counters (key, value) 
VALUES 
  ('total_visits', 1550), -- Tổng lượt truy cập giả lập ban đầu
  ('today_visits', 0),
  ('month_visits', 0),
  ('last_reset_date', to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD')::bigint);

-- 4. Cấu hình bảo mật (Nếu chưa có)
ALTER TABLE site_counters ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để tạo mới (tránh trùng lặp)
DROP POLICY IF EXISTS "Public read counters" ON site_counters;
DROP POLICY IF EXISTS "Public update counters" ON site_counters;
DROP POLICY IF EXISTS "Public insert counters" ON site_counters;

-- Tạo Policy cho phép mọi người Đọc và Ghi (cần thiết để tăng bộ đếm từ Client)
CREATE POLICY "Public read counters" ON site_counters FOR SELECT USING (true);
CREATE POLICY "Public update counters" ON site_counters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public insert counters" ON site_counters FOR INSERT WITH CHECK (true);
