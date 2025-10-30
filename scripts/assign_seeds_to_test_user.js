#!/usr/bin/env node
import * as User from "../src/models/user.js";
import pool from "../src/db.js";

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

    await pool.query("BEGIN");

    // Deduplica categorias globais por 'nome'
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
    const dedupRes = await pool.query(dedupSql);
    console.log(
      "Removed global duplicate categories:",
      dedupRes.rows[0].removed_count
    );

    // Atribui as remanescentes ao usuário
    const updateRes = await pool.query(
      `UPDATE categories
         SET user_id = $1
       WHERE user_id IS NULL
       RETURNING id, nome`,
      [user.id]
    );

    console.log(
      `Assigned ${updateRes.rowCount} categories to user id=${user.id}`
    );
    if (updateRes.rowCount > 0) {
      console.log("Sample updated categories:", updateRes.rows.slice(0, 10));
    }

    await pool.query("COMMIT");
  } catch (err) {
    console.error("Error:", err);
    try {
      await pool.query("ROLLBACK");
    } catch (_) {}
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (_) {}
  }
}

main();
