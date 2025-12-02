#!/usr/bin/env node
import { prisma } from "../src/lib/prisma.js";

// Deletes the most recent category created by the seed test user (seed.user+test@local)
async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "seed.user+test@local" },
    });
    if (!user) {
      console.log("Seed user not found. Nothing to delete.");
      return;
    }

    const cat = await prisma.category.findFirst({
      where: { user_id: user.id },
      orderBy: { id: "desc" },
    });
    if (!cat) {
      console.log("No categories found for user.");
      return;
    }

    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`Deleted category id=${cat.id} nome='${cat.nome}'`);
  } catch (err) {
    console.error("Error deleting category:", err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
