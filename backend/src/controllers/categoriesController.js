import * as Category from "../models/category.js";

export async function listCategories(req, res) {
  try {
    const userId = req.user && req.user.id;
    const rows = await Category.findAll(userId);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar categorias:", err.message);
    res.status(500).json({ erro: "Erro ao listar categorias." });
  }
}

export async function getCategory(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const row = await Category.findById(id);
    if (!row)
      return res.status(404).json({ erro: "Categoria não encontrada." });
    if (row.user_id && row.user_id !== req.user.id)
      return res.status(404).json({ erro: "Categoria não encontrada." });
    res.json(row);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao buscar categoria." });
  }
}

export async function createCategory(req, res) {
  const { nome, tipo } = req.body;
  if (!nome || !tipo)
    return res.status(400).json({ erro: "Preencha nome e tipo." });
  if (!["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    const userId = req.user && req.user.id;
    const created = await Category.create({ nome, tipo, user_id: userId });
    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao criar categoria." });
  }
}

export async function updateCategory(req, res) {
  const id = Number(req.params.id);
  const { nome, tipo } = req.body;
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  if (tipo && !["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    const updated = await Category.update(id, { nome, tipo }, req.user.id);
    if (!updated)
      return res
        .status(404)
        .json({ erro: "Categoria não encontrada ou não pertence ao usuário." });
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar categoria." });
  }
}

export async function deleteCategory(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const deleted = await Category.remove(id, req.user.id);
    if (!deleted)
      return res
        .status(404)
        .json({ erro: "Categoria não encontrada ou não pertence ao usuário." });
    res.json({ mensagem: "Categoria deletada." });
  } catch (err) {
    console.error("Erro ao deletar categoria:", err.message);
    res.status(500).json({ erro: "Erro ao deletar categoria." });
  }
}
