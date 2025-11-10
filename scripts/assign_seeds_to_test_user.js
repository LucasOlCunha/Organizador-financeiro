#!/usr/bin/env node
import * as User from "../src/models/user.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const name = "Seed Test User";
  const email = "seed.user+test@local";
  const password = "Test@1234";

  try {
    let user = await User.findByEmail(email);
    if (user) {
      console.log("User already exists:", { id: user.id, email: user.email });
    } else {
      user = await User.create({ name, email, password });
      console.log("Created user:", { id: user.id, email: user.email });
    }

    // Use raw SQL to dedupe global categories, then update remaining to user
    const dedupSql = `
      WITH dups AS (
        SELECT id, nome,
               ROW_NUMBER() OVER (PARTITION BY nome ORDER BY id) AS rn
        FROM categories
        WHERE user_id IS NULL
      ),
      removed AS (
        DELETE FROM categories c
        USING dups d
        WHERE c.id = d.id AND d.rn > 1
        RETURNING c.id
      )
      SELECT COUNT(*) AS removed_count FROM removed;
    `;
    const dedupRes = await prisma.$queryRawUnsafe(dedupSql);
    const removedCount =
      Array.isArray(dedupRes) && dedupRes[0]
        ? dedupRes[0].removed_count || dedupRes[0].removed_count
        : 0;
    console.log("Removed global duplicate categories:", removedCount);

    // Assign remaining global categories to user
    const updateRes = await prisma.$executeRawUnsafe(
      `UPDATE categories SET user_id = ${user.id} WHERE user_id IS NULL RETURNING id, nome`
    );
    // $executeRawUnsafe returns command completion for DDL/DML in some drivers; fetch assigned rows separately
    const assigned = await prisma.category.findMany({
      where: { user_id: user.id },
      orderBy: { id: "asc" },
    });
    console.log(`Assigned ${assigned.length} categories to user id=${user.id}`);
    if (assigned.length > 0)
      console.log("Sample updated categories:", assigned.slice(0, 10));
  } catch (err) {
    console.error("Error:", err);
    process.exitCode = 1;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (_) {}
  }
}

main();
