import { prisma } from "../lib/prisma.js";

export async function findAll(userId = null) {
  if (userId) {
    return await prisma.bank.findMany({
      where: { user_id: Number(userId), deleted_at: null },
      select: {
        id: true,
        nome: true,
        saldo_inicial: true,
        data_criacao: true,
      },
      orderBy: { nome: "asc" },
    });
  }
  return await prisma.bank.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      nome: true,
      saldo_inicial: true,
      data_criacao: true,
    },
    orderBy: { nome: "asc" },
  });
}

export async function findById(id) {
  return await prisma.bank.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      nome: true,
      saldo_inicial: true,
      data_criacao: true,
      deleted_at: true,
    },
  });
}

export async function create({ nome, saldo_inicial = 0, user_id = null }) {
  return await prisma.bank.create({
    data: {
      nome,
      saldo_inicial:
        typeof saldo_inicial === "number"
          ? saldo_inicial
          : Number(saldo_inicial || 0),
      user_id: user_id ? Number(user_id) : null,
    },
    select: {
      id: true,
      nome: true,
      saldo_inicial: true,
      data_criacao: true,
    },
  });
}

export async function update(id, fields, ownerId = null) {
  const data = {};
  if (fields.nome !== undefined) data.nome = fields.nome;
  if (fields.saldo_inicial !== undefined)
    data.saldo_inicial =
      typeof fields.saldo_inicial === "number"
        ? fields.saldo_inicial
        : Number(fields.saldo_inicial || 0);

  if (Object.keys(data).length === 0) return null;

  if (ownerId) {
    const res = await prisma.bank.updateMany({
      where: { id: Number(id), user_id: Number(ownerId), deleted_at: null },
      data,
    });
    if (res.count === 0) return null;
    return await findById(id);
  }

  try {
    return await prisma.bank.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        nome: true,
        saldo_inicial: true,
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
    const res = await prisma.bank.updateMany({
      where: { id: Number(id), user_id: Number(ownerId), deleted_at: null },
      data: { deleted_at: now },
    });
    return res.count === 0 ? null : { id };
  }

  try {
    const r = await prisma.bank.update({
      where: { id: Number(id) },
      data: { deleted_at: now },
    });
    return { id: r.id };
  } catch (e) {
    return null;
  }
}
