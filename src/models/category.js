import pool from "../db.js";

// Data access layer for categories
export async function findAll(userId = null) {
  if (userId) {
    const res = await pool.query(
      "SELECT id, nome, tipo, data_criacao FROM categories WHERE user_id = $1 ORDER BY id",
      [userId]
    );
    return res.rows;
  }
  const res = await pool.query(
    "SELECT id, nome, tipo, data_criacao, user_id FROM categories ORDER BY id"
  );
  return res.rows;
}

export async function findById(id) {
  const res = await pool.query(
    "SELECT id, nome, tipo, data_criacao, user_id FROM categories WHERE id = $1",
    [id]
  );
  return res.rows[0] || null;
}

export async function create({ nome, tipo, user_id = null }) {
  const res = await pool.query(
    "INSERT INTO categories (nome, tipo, user_id) VALUES ($1, $2, $3) RETURNING id, nome, tipo, data_criacao, user_id",
    [nome, tipo, user_id]
  );
  return res.rows[0];
}

export async function update(id, fields, ownerId = null) {
  const sets = [];
  const values = [];
  let idx = 1;
  if (fields.nome !== undefined) {
    sets.push(`nome = $${idx++}`);
    values.push(fields.nome);
  }
  if (fields.tipo !== undefined) {
    sets.push(`tipo = $${idx++}`);
    values.push(fields.tipo);
  }
  if (sets.length === 0) return null;
  // WHERE clause: enforce ownerId if provided
  if (ownerId) {
    values.push(id);
    values.push(ownerId);
    const sql = `UPDATE categories SET ${sets.join(
      ", "
    )} WHERE id = $${idx} AND user_id = $${
      idx + 1
    } RETURNING id, nome, tipo, data_criacao, user_id`;
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  }
  values.push(id);
  const sql = `UPDATE categories SET ${sets.join(
    ", "
  )} WHERE id = $${idx} RETURNING id, nome, tipo, data_criacao, user_id`;
  const res = await pool.query(sql, values);
  return res.rows[0] || null;
}

export async function remove(id, ownerId = null) {
  if (ownerId) {
    const res = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, ownerId]
    );
    return res.rows[0] || null;
  }
  const res = await pool.query(
    "DELETE FROM categories WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] || null;
}
