import { Pool } from "pg";

let pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Nếu deploy lên Vercel/Production thì cần thêm SSL
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

pool = global.pool;

export default pool;
