import * as Bank from "../models/bank.js";

export async function listBanks(req, res) {
  try {
    const userId = req.user && req.user.id;
    const rows = await Bank.findAll(userId);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar bancos:", err.message);
    res.status(500).json({ erro: "Erro ao listar bancos." });
  }
}

export async function getBank(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const row = await Bank.findById(id);
    if (!row) return res.status(404).json({ erro: "Banco não encontrado." });
    if (row.user_id && row.user_id !== req.user.id)
      return res.status(404).json({ erro: "Banco não encontrado." });
    res.json(row);
  } catch (err) {
    console.error("Erro ao buscar banco:", err.message);
    res.status(500).json({ erro: "Erro ao buscar banco." });
  }
}

export async function createBank(req, res) {
  const { nome } = req.body;
  const { saldo_inicial } = req.body;
  if (!nome) return res.status(400).json({ erro: "Preencha o nome do banco." });

  try {
    const userId = req.user && req.user.id;
    const created = await Bank.create({
      nome,
      saldo_inicial: saldo_inicial || 0,
      user_id: userId,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar banco:", err.message);
    res.status(500).json({ erro: "Erro ao criar banco." });
  }
}

export async function updateBank(req, res) {
  const id = Number(req.params.id);
  const { nome, saldo_inicial } = req.body;
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });

  try {
    const updated = await Bank.update(id, { nome, saldo_inicial }, req.user.id);
    if (!updated)
      return res
        .status(404)
        .json({ erro: "Banco não encontrado ou não pertence ao usuário." });
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar banco:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar banco." });
  }
}

export async function deleteBank(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ erro: "ID inválido." });
  try {
    const deleted = await Bank.remove(id, req.user.id);
    if (!deleted)
      return res
        .status(404)
        .json({ erro: "Banco não encontrado ou não pertence ao usuário." });
    res.json({ mensagem: "Banco deletado." });
  } catch (err) {
    console.error("Erro ao deletar banco:", err.message);
    res.status(500).json({ erro: "Erro ao deletar banco." });
  }
}
