#!/usr/bin/env node
import pool from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

async function check() {
  try {
    console.log("Checking transactions table...");

    const cols = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'transactions'
       ORDER BY ordinal_position`
    );

    if (cols.rows.length === 0) {
      console.log("Table `transactions` does NOT exist.");
    } else {
      console.log("Table `transactions` exists with columns:");
      cols.rows.forEach((c) =>
        console.log(
          ` - ${c.column_name} (${c.data_type}) nullable=${c.is_nullable}`
        )
      );

      const cnt = await pool.query(
        "SELECT COUNT(*)::int AS count FROM transactions"
      );
      console.log(`Rows in transactions: ${cnt.rows[0].count}`);
    }
  } catch (err) {
    console.error("Error checking table:", err.message || err);
    process.exitCode = 2;
  } finally {
    try {
      await pool.end();
    } catch (e) {}
  }
}

check();
