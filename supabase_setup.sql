-- Supabase 설정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS mboard (
  idx SERIAL PRIMARY KEY,
  subject VARCHAR(255) DEFAULT '',
  name VARCHAR(100) DEFAULT '',
  password VARCHAR(255),
  content TEXT,
  hit INTEGER DEFAULT 0,
  imglist VARCHAR(255) DEFAULT '',
  rdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(100)
);

-- 2. Row Level Security 비활성화 (필요시)
ALTER TABLE mboard DISABLE ROW LEVEL SECURITY;

-- 3. 샘플 데이터 삽입
INSERT INTO mboard (subject, name, password, content, hit, rdate) VALUES
('Welcome to Tech Forum!', 'Admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'This is a sample post. Password is "password".', 0, CURRENT_TIMESTAMP),
('Getting Started with Node.js', 'Developer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Node.js is a powerful JavaScript runtime. This post explains the basics.', 0, CURRENT_TIMESTAMP);

-- 4. 테이블 권한 설정
GRANT ALL PRIVILEGES ON TABLE mboard TO postgres;
GRANT USAGE, SELECT ON SEQUENCE mboard_idx_seq TO postgres; 