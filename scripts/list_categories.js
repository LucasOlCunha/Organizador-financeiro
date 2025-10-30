#!/usr/bin/env node
import pool from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

async function list() {
  try {
    const res = await pool.query(
      "SELECT id, nome, tipo, user_id, data_criacao FROM categories ORDER BY id"
    );
    if (res.rows.length === 0) {
      console.log("No categories found.");
    } else {
      console.log("Categories:");
      res.rows.forEach((r) =>
        console.log(
          ` - id=${r.id} nome='${r.nome}' tipo='${r.tipo}' user_id=${r.user_id} data_criacao=${r.data_criacao}`
        )
      );
    }
  } catch (err) {
    console.error("Error listing categories:", err.message || err);
    process.exitCode = 2;
  } finally {
    try {
      await pool.end();
    } catch (e) {}
  }
}

list();
