DROP TABLE IF EXISTS animes;

CREATE TABLE animes (
    -- Các trường cơ bản (Flat fields) để query cho nhanh
    id INT PRIMARY KEY,                -- Dùng luôn ID của file JSON (23778)
    title TEXT NOT NULL,
    slug TEXT,
    synopsis TEXT,
    views INT DEFAULT 0,
    
    -- Xử lý trường đặc biệt
    release_year INT,                  -- Trích xuất từ object "releaseYear": { "name": "2025" ...}
    thumbnail TEXT,
    poster TEXT,
    url TEXT,
    
    -- Ngày tháng (cần convert từ string "20251207..." sang timestamp)
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Các trường mảng/object phức tạp -> Lưu dạng JSONB
    genres JSONB,                      -- Lưu nguyên mảng genres
    studios JSONB,                     -- Lưu nguyên mảng studios
    tags JSONB,                        -- Lưu nguyên mảng tags
    
    -- Lưu lại toàn bộ cục data gốc để backup hoặc lấy các trường nhỏ khác (isTrailer, links...)
    raw_data JSONB
);

-- Tạo Index để search cho nhanh
CREATE INDEX idx_animes_release_year ON animes(release_year);
CREATE INDEX idx_animes_views ON animes(views);
CREATE INDEX idx_animes_genres ON animes USING gin (genres); -- Index đặc biệt để tìm trong JSONB