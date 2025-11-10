import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

export async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      data_criacao: true,
    },
  });
}

export async function findById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, name: true, email: true, data_criacao: true },
  });
}

export async function findAll() {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, data_criacao: true },
    orderBy: { id: "asc" },
  });
}

export async function create({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, data_criacao: true },
  });
}
