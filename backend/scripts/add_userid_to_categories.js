#!/usr/bin/env node
import pool from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    console.log("Adding user_id column to categories (if not exists)");
    await pool.query(
      "ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id INTEGER"
    );

    console.log("Adding foreign key constraint if not exists");
    await pool.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'categories_user_id_fkey'
      ) THEN
        ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END$$;`);

    console.log("Creating index on user_id if not exists");
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)"
    );

    console.log("Done.");
  } catch (err) {
    console.error("Migration failed:", err.message || err);
    process.exitCode = 2;
  } finally {
    try {
      await pool.end();
    } catch (e) {}
  }
}

run();
