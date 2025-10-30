#!/usr/bin/env node
// Safe script to delete all rows from users table.
// Usage:
//   node scripts/clear_users.js --yes
// or
//   npm run db:clear-users

import pool from "../src/db.js";

const args = process.argv.slice(2);
const confirmed =
  args.includes("--yes") || process.env.CONFIRM_DELETE === "true";

async function clearUsers() {
  if (!confirmed) {
    console.log("This will DELETE ALL rows from the 'users' table.");
    console.log("To actually run this script, re-run with the --yes flag:");
    console.log("  node scripts/clear_users.js --yes");
    console.log("Or set environment variable: CONFIRM_DELETE=true");
    process.exit(1);
  }

  try {
    console.log("Deleting all users from database...");
    const res = await pool.query("DELETE FROM users RETURNING id");
    console.log(`Deleted ${res.rowCount} user(s).`);
    process.exit(0);
  } catch (err) {
    console.error("Error deleting users:", err.message || err);
    process.exit(2);
  } finally {
    // close pool
    try {
      await pool.end();
    } catch (e) {
      /* ignore */
    }
  }
}

clearUsers();
