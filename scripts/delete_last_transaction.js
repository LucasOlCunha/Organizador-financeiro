#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";

// Deletes the most recent transaction for the seed test user (seed.user+test@local)
async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "seed.user+test@local" },
    });
    if (!user) {
      console.log("Seed user not found. Nothing to delete.");
      return;
    }

    const tx = await prisma.transaction.findFirst({
      where: { user_id: user.id },
      orderBy: { data_criacao: "desc" },
    });
    if (!tx) {
      console.log("No transactions found for user.");
      return;
    }

    await prisma.transaction.delete({ where: { id: tx.id } });
    console.log(`Deleted transaction id=${tx.id}`);
  } catch (err) {
    console.error("Error deleting transaction:", err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
