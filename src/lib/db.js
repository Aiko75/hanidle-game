import { Pool } from "pg";

let pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

pool = global.pool;

export default pool;
