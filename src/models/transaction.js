import pool from "../db.js";

export async function findAll(userId = null, limit = 100) {
  if (userId) {
    const res = await pool.query(
      "SELECT id, descricao, valor, tipo, categoria_id, user_id, data_criacao FROM transactions WHERE user_id = $1 ORDER BY data_criacao DESC LIMIT $2",
      [userId, limit]
    );
    return res.rows;
  }
  const res = await pool.query(
    "SELECT id, descricao, valor, tipo, categoria_id, user_id, data_criacao FROM transactions ORDER BY data_criacao DESC LIMIT $1",
    [limit]
  );
  return res.rows;
}

export async function findById(id) {
  const res = await pool.query(
    "SELECT id, descricao, valor, tipo, categoria_id, user_id, data_criacao FROM transactions WHERE id = $1",
    [id]
  );
  return res.rows[0] || null;
}

export async function create({
  descricao,
  valor,
  tipo,
  categoria_id = null,
  user_id = null,
}) {
  const res = await pool.query(
    "INSERT INTO transactions (descricao, valor, tipo, categoria_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, descricao, valor, tipo, categoria_id, user_id, data_criacao",
    [descricao, valor, tipo, categoria_id, user_id]
  );
  return res.rows[0];
}

export async function update(id, fields, ownerId = null) {
  const sets = [];
  const values = [];
  let idx = 1;
  if (fields.descricao !== undefined) {
    sets.push(`descricao = $${idx++}`);
    values.push(fields.descricao);
  }
  if (fields.valor !== undefined) {
    sets.push(`valor = $${idx++}`);
    values.push(fields.valor);
  }
  if (fields.tipo !== undefined) {
    sets.push(`tipo = $${idx++}`);
    values.push(fields.tipo);
  }
  if (fields.categoria_id !== undefined) {
    sets.push(`categoria_id = $${idx++}`);
    values.push(fields.categoria_id);
  }
  if (sets.length === 0) return null;

  if (ownerId) {
    values.push(id);
    values.push(ownerId);
    const sql = `UPDATE transactions SET ${sets.join(
      ", "
    )} WHERE id = $${idx} AND user_id = $${
      idx + 1
    } RETURNING id, descricao, valor, tipo, categoria_id, user_id, data_criacao`;
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  }

  values.push(id);
  const sql = `UPDATE transactions SET ${sets.join(
    ", "
  )} WHERE id = $${idx} RETURNING id, descricao, valor, tipo, categoria_id, user_id, data_criacao`;
  const res = await pool.query(sql, values);
  return res.rows[0] || null;
}

export async function remove(id, ownerId = null) {
  if (ownerId) {
    const res = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, ownerId]
    );
    return res.rows[0] || null;
  }
  const res = await pool.query(
    "DELETE FROM transactions WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rows[0] || null;
}
