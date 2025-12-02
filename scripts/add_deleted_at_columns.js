#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";

async function run() {
  try {
    console.log(
      "Adding deleted_at column to categories and transactions if not present..."
    );
    await prisma.$executeRawUnsafe(
      "ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz"
    );
    await prisma.$executeRawUnsafe(
      "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at timestamptz"
    );
    console.log("Done.");
  } catch (err) {
    console.error("Migration failed:", err.message || err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
