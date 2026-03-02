import { prisma } from "../lib/prisma.js";

export async function getBalance(userId, { inicio = null, fim = null } = {}) {
  const whereBase = {
    deleted_at: null,
    user_id: Number(userId),
  };

  if (inicio || fim) {
    whereBase.data_criacao = {};
    if (inicio) whereBase.data_criacao.gte = inicio;
    if (fim) whereBase.data_criacao.lte = fim;
  }

  const TIPO_RECEITA = "receita";
  const TIPO_DESPESA = "despesa";

  const [receitasAgg, despesasAgg, user, banksAgg] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { valor: true },
      where: { ...whereBase, tipo: TIPO_RECEITA },
    }),
    prisma.transaction.aggregate({
      _sum: { valor: true },
      where: { ...whereBase, tipo: TIPO_DESPESA },
    }),
    prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { saldo_inicial: true },
    }),
    prisma.bank.aggregate({
      _sum: { saldo_inicial: true },
      where: { deleted_at: null, user_id: Number(userId) },
    }),
  ]);

  const totalReceitas = Number(receitasAgg._sum.valor || 0);
  const totalDespesas = Number(despesasAgg._sum.valor || 0);
  const saldoInicial = Number(user?.saldo_inicial || 0);
  const totalBankInitialBalance = Number(banksAgg._sum.saldo_inicial || 0);

  const saldoSemInicial = totalReceitas - totalDespesas;
  const saldoTotal = saldoInicial + totalBankInitialBalance + saldoSemInicial;

  return {
    saldoInicial,
    totalReceitas,
    totalDespesas,
    saldoSemInicial,
    saldoTotal,
  };
}
