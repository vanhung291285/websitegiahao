
-- ==============================================================================
-- SCRIPT CẬP NHẬT: THÊM CỘT CHIỀU CAO BANNER
-- Hướng dẫn: Copy vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- Thêm cột banner_height vào bảng school_config với giá trị mặc định 400 (px)
ALTER TABLE school_config 
ADD COLUMN IF NOT EXISTS banner_height INTEGER DEFAULT 400;

-- Cập nhật giá trị mặc định cho các bản ghi hiện có (nếu null)
UPDATE school_config 
SET banner_height = 400 
WHERE banner_height IS NULL;
