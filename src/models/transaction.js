import { prisma } from "../lib/prisma.js";

const INITIAL_DESCRIPTION = "Saldo inicial";
const TIPO_RECEITA = "receita";
const TIPO_DESPESA = "despesa";

export async function findAll(userId = null, limit = 100) {
  if (userId) {
    return await prisma.transaction.findMany({
      where: { user_id: Number(userId), deleted_at: null },
      select: {
        id: true,
        descricao: true,
        valor: true,
        tipo: true,
        categoria_id: true,
        user_id: true,
        data_criacao: true,
        deleted_at: true,
      },
      orderBy: { data_criacao: "desc" },
      take: Number(limit),
    });
  }
  return await prisma.transaction.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      descricao: true,
      valor: true,
      tipo: true,
      categoria_id: true,
      user_id: true,
      data_criacao: true,
      deleted_at: true,
    },
    orderBy: { data_criacao: "desc" },
    take: Number(limit),
  });
}

export async function findById(id) {
  return await prisma.transaction.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      descricao: true,
      valor: true,
      tipo: true,
      categoria_id: true,
      user_id: true,
      data_criacao: true,
      deleted_at: true,
    },
  });
}

export async function create({
  descricao,
  valor,
  tipo,
  categoria_id = null,
  user_id = null,
}) {
  return await prisma.transaction.create({
    data: {
      descricao,
      valor: typeof valor === "number" ? String(valor) : valor,
      tipo,
      categoria_id: categoria_id ? Number(categoria_id) : null,
      user_id: user_id ? Number(user_id) : null,
    },
    select: {
      id: true,
      descricao: true,
      valor: true,
      tipo: true,
      categoria_id: true,
      user_id: true,
      data_criacao: true,
      deleted_at: true,
    },
  });
}

export async function update(id, fields, ownerId = null) {
  const data = {};
  if (fields.descricao !== undefined) data.descricao = fields.descricao;
  if (fields.valor !== undefined)
    data.valor =
      typeof fields.valor === "number" ? String(fields.valor) : fields.valor;
  if (fields.tipo !== undefined) data.tipo = fields.tipo;
  if (fields.categoria_id !== undefined)
    data.categoria_id = fields.categoria_id
      ? Number(fields.categoria_id)
      : null;

  if (Object.keys(data).length === 0) return null;

  if (ownerId) {
    const res = await prisma.transaction.updateMany({
      where: { id: Number(id), user_id: Number(ownerId), deleted_at: null },
      data,
    });
    if (res.count === 0) return null;
    return await findById(id);
  }

  try {
    return await prisma.transaction.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        descricao: true,
        valor: true,
        tipo: true,
        categoria_id: true,
        user_id: true,
        data_criacao: true,
        deleted_at: true,
      },
    });
  } catch (e) {
    return null;
  }
}

export async function remove(id, ownerId = null) {
  const now = new Date();
  if (ownerId) {
    const res = await prisma.transaction.updateMany({
      where: { id: Number(id), user_id: Number(ownerId), deleted_at: null },
      data: { deleted_at: now },
    });
    return res.count === 0 ? null : { id };
  }

  try {
    const r = await prisma.transaction.update({
      where: { id: Number(id) },
      data: { deleted_at: now },
    });
    return { id: r.id };
  } catch (e) {
    return null;
  }
}

export async function getBalance(
  userId = null,
  { inicio = null, fim = null } = {}
) {
  const whereBase = {
    deleted_at: null,
  };

  if (userId) {
    whereBase.user_id = Number(userId);
  }

  if (inicio || fim) {
    whereBase.data_criacao = {};
    if (inicio) whereBase.data_criacao.gte = inicio;
    if (fim) whereBase.data_criacao.lte = fim;
  }

  // aqui usamos os mesmos valores do campo `tipo` que você já usa nas transações
  const TIPO_RECEITA = "receita";
  const TIPO_DESPESA = "despesa";

  const [receitasAgg, despesasAgg] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { valor: true },
      where: {
        ...whereBase,
        tipo: TIPO_RECEITA,
      },
    }),
    prisma.transaction.aggregate({
      _sum: { valor: true },
      where: {
        ...whereBase,
        tipo: TIPO_DESPESA,
      },
    }),
  ]);

  const totalReceitas = Number(receitasAgg._sum.valor || 0);
  const totalDespesas = Number(despesasAgg._sum.valor || 0);
  const saldo = totalReceitas - totalDespesas;

  return {
    totalReceitas,
    totalDespesas,
    saldo,
  };
}
export async function getInitialBalance(userId) {
  const row = await prisma.transaction.findFirst({
    where: {
      user_id: Number(userId),
      deleted_at: null,
      descricao: INITIAL_DESCRIPTION,
      tipo: TIPO_RECEITA,
    },
  });

  return row ? Number(row.valor) : 0;
}

export async function setInitialBalance(userId, valor) {
  const existing = await prisma.transaction.findFirst({
    where: {
      user_id: Number(userId),
      deleted_at: null,
      descricao: INITIAL_DESCRIPTION,
      tipo: TIPO_RECEITA,
    },
  });

  const data = {
    descricao: INITIAL_DESCRIPTION,
    valor: typeof valor === "number" ? String(valor) : valor,
    tipo: TIPO_RECEITA,
    categoria_id: null,
    user_id: Number(userId),
  };

  if (existing) {
    // Atualiza o saldo inicial
    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data,
    });
    return updated;
  }

  // Cria o saldo inicial
  const created = await prisma.transaction.create({ data });
  return created;
}
