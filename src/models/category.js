import { prisma } from "../lib/prisma.js";

// Data access layer for categories (Prisma)
export async function findAll(userId = null) {
  if (userId) {
    return await prisma.category.findMany({
      where: { user_id: Number(userId), deleted_at: null },
      select: { id: true, nome: true, tipo: true, data_criacao: true },
      orderBy: { id: "asc" },
    });
  }
  return await prisma.category.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      nome: true,
      tipo: true,
      data_criacao: true,
      user_id: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function findById(id) {
  return await prisma.category.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      nome: true,
      tipo: true,
      data_criacao: true,
      user_id: true,
      deleted_at: true,
    },
  });
}

export async function create({ nome, tipo, user_id = null }) {
  return await prisma.category.create({
    data: { nome, tipo, user_id: user_id ? Number(user_id) : null },
    select: {
      id: true,
      nome: true,
      tipo: true,
      data_criacao: true,
      user_id: true,
    },
  });
}

export async function update(id, fields, ownerId = null) {
  // if ownerId is provided, use updateMany to enforce ownership then fetch
  if (ownerId) {
    const res = await prisma.category.updateMany({
      where: { id: Number(id), user_id: Number(ownerId) },
      data: { ...fields },
    });
    if (res.count === 0) return null;
    return await findById(id);
  }

  try {
    return await prisma.category.update({
      where: { id: Number(id) },
      data: { ...fields },
      select: {
        id: true,
        nome: true,
        tipo: true,
        data_criacao: true,
        user_id: true,
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
    const res = await prisma.category.updateMany({
      where: { id: Number(id), user_id: Number(ownerId), deleted_at: null },
      data: { deleted_at: now },
    });
    return res.count === 0 ? null : { id };
  }

  try {
    const r = await prisma.category.update({
      where: { id: Number(id) },
      data: { deleted_at: now },
    });
    return { id: r.id };
  } catch (e) {
    return null;
  }
}
