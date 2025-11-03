import * as Transaction from "../models/transaction.js";

export async function listTransactions(req, res) {
  try {
    const userId = req.user && req.user.id;
    const rows = await Transaction.findAll(userId);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar transações:", err.message);
    res.status(500).json({ erro: "Erro ao listar transações." });
  }
}

export async function getTransaction(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const row = await Transaction.findById(id);
    if (!row)
      return res.status(404).json({ erro: "Transação não encontrada." });
    if (row.user_id && row.user_id !== req.user.id)
      return res.status(404).json({ erro: "Transação não encontrada." });
    res.json(row);
  } catch (err) {
    console.error("Erro ao buscar transação:", err.message);
    res.status(500).json({ erro: "Erro ao buscar transação." });
  }
}

export async function createTransaction(req, res) {
  const { descricao, valor, tipo, categoria_id } = req.body;
  if (!descricao || valor === undefined || !tipo)
    return res.status(400).json({ erro: "Preencha descricao, valor e tipo." });
  if (!["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    const userId = req.user && req.user.id;
    const created = await Transaction.create({
      descricao,
      valor,
      tipo,
      categoria_id,
      user_id: userId,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar transação:", err.message);
    res.status(500).json({ erro: "Erro ao criar transação." });
  }
}

export async function updateTransaction(req, res) {
  const id = Number(req.params.id);
  const { descricao, valor, tipo, categoria_id } = req.body;
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  if (tipo && !["receita", "despesa"].includes(tipo))
    return res
      .status(400)
      .json({ erro: "Tipo inválido. Use 'receita' ou 'despesa'." });

  try {
    const updated = await Transaction.update(
      id,
      { descricao, valor, tipo, categoria_id },
      req.user.id
    );
    if (!updated)
      return res
        .status(404)
        .json({ erro: "Transação não encontrada ou não pertence ao usuário." });
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar transação:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar transação." });
  }
}

export async function deleteTransaction(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const deleted = await Transaction.remove(id, req.user.id);
    if (!deleted)
      return res
        .status(404)
        .json({ erro: "Transação não encontrada ou não pertence ao usuário." });
    res.json({ mensagem: "Transação deletada." });
  } catch (err) {
    console.error("Erro ao deletar transação:", err.message);
    res.status(500).json({ erro: "Erro ao deletar transação." });
  }
}
