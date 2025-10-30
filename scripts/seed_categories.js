#!/usr/bin/env node
import pool from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

const args = process.argv.slice(2);
const confirmed = args.includes("--yes") || process.env.CONFIRM_SEED === "true";

const categories = [
  { nome: "Salário", tipo: "receita" },
  { nome: "Freelance", tipo: "receita" },
  { nome: "Investimentos", tipo: "receita" },
  { nome: "Aluguel", tipo: "despesa" },
  { nome: "Supermercado", tipo: "despesa" },
  { nome: "Transporte", tipo: "despesa" },
  { nome: "Lazer", tipo: "despesa" },
];

async function seed() {
  if (!confirmed) {
    console.log("This will INSERT sample categories into `categories`.");
    console.log(
      "Run with --yes to actually execute: node scripts/seed_categories.js --yes"
    );
    console.log("Or set env: CONFIRM_SEED=true");
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let inserted = 0;
    for (const cat of categories) {
      const res = await client.query(
        "INSERT INTO categories (nome, tipo) VALUES ($1, $2) RETURNING id",
        [cat.nome, cat.tipo]
      );
      if (res.rows.length > 0) inserted += 1;
    }
    await client.query("COMMIT");
    console.log(`Inserted ${inserted} categories.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message || err);
    process.exitCode = 2;
  } finally {
    client.release();
    try {
      await pool.end();
    } catch (e) {}
  }
}

seed();
