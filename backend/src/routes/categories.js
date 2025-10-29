import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// List all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, tipo, data_criacao FROM categories ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar categorias:", err.message);
    res.status(500).json({ erro: "Erro ao listar categorias." });
  }
});

// Get one category by id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });

  try {
    const result = await pool.query(
      "SELECT id, nome, tipo, data_criacao FROM categories WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Categoria não encontrada." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao buscar categoria." });
  }
});

// Create category (protected)
router.post("/", auth, async (req, res) => {
  const { nome, tipo } = req.body;
  if (!nome || !tipo)
    return res.status(400).json({ erro: "Preencha nome e tipo." });
  if (!["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    const result = await pool.query(
      "INSERT INTO categories (nome, tipo) VALUES ($1, $2) RETURNING id, nome, tipo, data_criacao",
      [nome, tipo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao criar categoria." });
  }
});

// Update category (protected)
router.patch("/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const { nome, tipo } = req.body;
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  if (tipo && !["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    if (nome !== undefined) {
      fields.push(`nome = $${idx++}`);
      values.push(nome);
    }
    if (tipo !== undefined) {
      fields.push(`tipo = $${idx++}`);
      values.push(tipo);
    }
    if (fields.length === 0)
      return res.status(400).json({ erro: "Nada para atualizar." });

    values.push(id);
    const sql = `UPDATE categories SET ${fields.join(
      ", "
    )} WHERE id = $${idx} RETURNING id, nome, tipo, data_criacao`;
    const result = await pool.query(sql, values);
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Categoria não encontrada." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar categoria." });
  }
});

// Delete category (protected)
router.delete("/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });

  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Categoria não encontrada." });
    res.json({ mensagem: "Categoria deletada." });
  } catch (err) {
    console.error("Erro ao deletar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao deletar categoria." });
  }
});

export default router;
