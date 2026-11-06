import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL was not loaded from .env.local");
  process.exitCode = 1;
} else {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    for (let i = 1; i <= 5; i++) {
      const start = performance.now();
      await pool.query("SELECT 1");

      console.log(
        `Test ${i}: ${(performance.now() - start).toFixed(0)} ms`,
      );
    }
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    await pool.end();
  }
}