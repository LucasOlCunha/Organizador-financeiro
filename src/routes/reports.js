// src/routes/reports.js

import { Router } from "express";
import auth from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// todas as rotas daqui exigem estar logado
router.use(auth);

router.get("/despesas-por-categoria", async (req, res) => {
  try {
    const userId = req.user?.id ?? req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;

    // type vem do front como INCOME | EXPENSE
    const type =
      typeof req.query.type === "string" ? req.query.type : "EXPENSE";

    // no banco você está usando "receita" / "despesa"
    const dbType = type === "INCOME" ? "receita" : "despesa";

    let dateFilter = {};

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      dateFilter = {
        data_criacao: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const grouped = await prisma.transaction.groupBy({
      by: ["categoria_id"],
      where: {
        user_id: userId,
        tipo: dbType,
        deleted_at: null,
        ...dateFilter,
      },
      _sum: {
        valor: true,
      },
    });

    const categoriaIds = grouped
      .map((g) => g.categoria_id)
      .filter((id) => id !== null);

    const categorias = await prisma.category.findMany({
      where: {
        id: { in: categoriaIds },
        deleted_at: null,
        user_id: userId,
      },
    });

    const result = grouped.map((g) => {
      const categoria = categorias.find((c) => c.id === g.categoria_id);

      return {
        categoriaId: g.categoria_id,
        categoriaNome: categoria?.nome ?? "Sem categoria",
        total: Number(g._sum.valor || 0),
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao gerar relatório de despesas por categoria" });
  }
});

export default router;
