#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import pool from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

const sqlPath = path.resolve(process.cwd(), "scripts", "create_categories.sql");

async function run() {
  try {
    const sql = await fs.readFile(sqlPath, "utf8");
    console.log("Running SQL migration:", sqlPath);
    const res = await pool.query(sql);
    console.log("Migration executed.");
    // res will be command completion; not always helpful for DDL
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
