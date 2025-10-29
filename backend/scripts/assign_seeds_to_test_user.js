#!/usr/bin/env node
import * as User from "../src/models/user.js";
import pool from "../src/db.js";

async function main() {
  // chosen by the assistant as requested
  const name = "Seed Test User";
  const email = "seed.user+test@local";
  const password = "Test@1234";

  try {
    // check if user exists
    const existing = await User.findByEmail(email);
    let user;
    if (existing) {
      console.log("User already exists:", {
        id: existing.id,
        email: existing.email,
      });
      user = existing;
    } else {
      user = await User.create({ name, email, password });
      console.log("Created user:", user);
    }

    // Update categories that are global (user_id IS NULL) to belong to this user
    const res = await pool.query(
      "UPDATE categories SET user_id = $1 WHERE user_id IS NULL RETURNING id, nome",
      [user.id]
    );

    console.log(`Assigned ${res.rowCount} categories to user id=${user.id}`);
    if (res.rowCount > 0) {
      console.log("Sample updated category ids:", res.rows.slice(0, 10));
    }

    // close pool
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
}

main();
