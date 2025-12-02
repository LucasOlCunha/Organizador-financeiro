import * as Transaction from "../models/transaction.js";

export async function getBalance(req, res) {
  try {
    const userId = req.user && req.user.id;
    const { inicio, fim } = req.query;

    const filtros = {
      inicio: inicio ? new Date(inicio) : null,
      fim: fim ? new Date(fim) : null,
    };

    const resumo = await Transaction.getBalance(userId, filtros);

    return res.json(resumo);
  } catch (err) {
    console.error("Erro ao calcular saldo:", err.message);
    return res.status(500).json({ erro: "Erro ao calcular saldo." });
  }
}
