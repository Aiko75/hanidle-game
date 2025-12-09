import { Pool } from "pg";

let pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // 👇 QUAN TRỌNG: Thêm đoạn này để kết nối Supabase không bị lỗi
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

pool = global.pool;

export default pool;
