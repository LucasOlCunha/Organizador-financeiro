import pool from "../db.js";
import bcrypt from "bcrypt";

export async function findByEmail(email) {
  const res = await pool.query(
    "SELECT id, name, email, password, data_criacao FROM users WHERE email = $1",
    [email]
  );
  return res.rows[0] || null;
}

export async function findById(id) {
  const res = await pool.query(
    "SELECT id, name, email, data_criacao FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0] || null;
}

export async function create({ name, email, password }) {
  // hash password inside model for consistent behavior
  const hashed = await bcrypt.hash(password, 10);
  const res = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, data_criacao",
    [name, email, hashed]
  );
  return res.rows[0];
}
