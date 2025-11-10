#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";
import dotenv from "dotenv";

dotenv.config();

async function check() {
  try {
    console.log("Checking transactions table...");

    const cols =
      await prisma.$queryRawUnsafe(`SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'transactions'
       ORDER BY ordinal_position`);

    if (!cols || cols.length === 0) {
      console.log("Table `transactions` does NOT exist.");
    } else {
      console.log("Table `transactions` exists with columns:");
      cols.forEach((c) =>
        console.log(
          ` - ${c.column_name} (${c.data_type}) nullable=${c.is_nullable}`
        )
      );

      const cnt = await prisma.$queryRawUnsafe(
        "SELECT COUNT(*)::int AS count FROM transactions"
      );
      // cnt is an array of rows
      const countVal =
        Array.isArray(cnt) && cnt[0] ? cnt[0].count || cnt[0].count : undefined;
      console.log(`Rows in transactions: ${countVal}`);
    }
  } catch (err) {
    console.error("Error checking table:", err.message || err);
    process.exitCode = 2;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  }
}

check();
