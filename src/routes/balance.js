import express from "express";
import auth from "../middleware/auth.js";
import {
  getBalance,
  getInitialBalance,
  setInitialBalance,
} from "../models/transaction.js";

const router = express.Router();

// GET /balance  → saldo completo (com saldo inicial)
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { inicio, fim } = req.query;
    const filtros = {
      inicio: inicio ? new Date(inicio) : null,
      fim: fim ? new Date(fim) : null,
    };

    const result = await getBalance(userId, filtros);
    return res.json(result);
  } catch (err) {
    console.error("Erro ao buscar saldo:", err);
    return res.status(500).json({ erro: "Erro ao buscar saldo." });
  }
});

// GET /balance/initial  → pega só o saldo inicial
router.get("/initial", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const saldoInicial = await getInitialBalance(userId);
    return res.json({ saldoInicial });
  } catch (err) {
    console.error("Erro ao buscar saldo inicial:", err);
    return res.status(500).json({ erro: "Erro ao buscar saldo inicial." });
  }
});

// POST /balance/initial  → define/atualiza saldo inicial
router.post("/initial", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { valor } = req.body;

    if (valor === undefined || valor === null || isNaN(Number(valor))) {
      return res
        .status(400)
        .json({ erro: "Informe um 'valor' numérico para o saldo inicial." });
    }

    const registro = await setInitialBalance(userId, Number(valor));
    const saldoInicial = await getInitialBalance(userId);

    return res.status(200).json({
      mensagem: "Saldo inicial definido com sucesso.",
      saldoInicial,
    });
  } catch (err) {
    console.error("Erro ao definir saldo inicial:", err);
    return res.status(500).json({ erro: "Erro ao definir saldo inicial." });
  }
});

export default router;
