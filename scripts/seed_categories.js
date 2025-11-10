#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";
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

  try {
    const creates = categories.map((cat) =>
      prisma.category.create({ data: { nome: cat.nome, tipo: cat.tipo } })
    );
    const res = await prisma.$transaction(creates);
    console.log(`Inserted ${res.length} categories.`);
  } catch (err) {
    console.error("Seed failed:", err.message || err);
    process.exitCode = 2;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  }
}

seed();
