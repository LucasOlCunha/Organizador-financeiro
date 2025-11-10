import { prisma } from "../lib/prisma.js";

export async function findAll(userId = null, limit = 100) {
  if (userId) {
    return await prisma.transaction.findMany({
      where: { user_id: Number(userId) },
      select: {
        id: true,
        descricao: true,
        valor: true,
        tipo: true,
        categoria_id: true,
        user_id: true,
        data_criacao: true,
      },
      orderBy: { data_criacao: "desc" },
      take: Number(limit),
    });
  }
  return await prisma.transaction.findMany({
    select: {
      id: true,
      descricao: true,
      valor: true,
      tipo: true,
      categoria_id: true,
      user_id: true,
      data_criacao: true,
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
      where: { id: Number(id), user_id: Number(ownerId) },
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
      },
    });
  } catch (e) {
    return null;
  }
}

export async function remove(id, ownerId = null) {
  if (ownerId) {
    const res = await prisma.transaction.deleteMany({
      where: { id: Number(id), user_id: Number(ownerId) },
    });
    return res.count === 0 ? null : { id };
  }

  try {
    const r = await prisma.transaction.delete({ where: { id: Number(id) } });
    return { id: r.id };
  } catch (e) {
    return null;
  }
}
