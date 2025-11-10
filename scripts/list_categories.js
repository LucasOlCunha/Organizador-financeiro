#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";
import dotenv from "dotenv";

dotenv.config();

async function list() {
  try {
    const rows = await prisma.category.findMany({ orderBy: { id: "asc" } });
    if (!rows || rows.length === 0) {
      console.log("No categories found.");
    } else {
      console.log("Categories:");
      rows.forEach((r) =>
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
      await prisma.$disconnect();
    } catch (e) {}
  }
}

list();
