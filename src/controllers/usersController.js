import * as User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios." });
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });

    const created = await User.create({ name, email, password });
    return res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios." });
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const created = await User.create({ name, email, password });

    // versão "safe" para retorno (sem senha)
    const userSafe = await User.findById(Number(created.id));

    const secret = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";
    const token = jwt.sign(
      { id: userSafe.id, email: userSafe.email, name: userSafe.name },
      secret,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      mensagem: "Usuário registrado com sucesso!",
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
}

export async function listUsers(req, res) {
  try {
    if (typeof User.findAll !== "function") {
      return res
        .status(500)
        .json({ erro: "findAll não implementado no model de usuário." });
    }
    const result = await User.findAll();
    return res.json(result);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    return res.status(500).json({ erro: "Erro ao buscar usuários." });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ erro: "Preencha email e senha." });

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ erro: "Credenciais inválidas." });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      return res.status(401).json({ erro: "Credenciais inválidas." });

    // Busca versão "safe" (sem senha) para retornar
    const userSafe = await User.findById(Number(user.id));

    const secret = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: "1h" }
    );

    return res.json({
      mensagem: "Login realizado com sucesso!",
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro ao efetuar login." });
  }
}

export async function me(req, res) {
  try {
    const userId = Number(req.user?.id); // ✅ garante número
    if (!userId) return res.status(401).json({ erro: "Não autorizado." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado." });

    return res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário autenticado:", err);
    return res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}

export async function getById(req, res) {
  try {
    const idNum = Number(req.params.id); // ✅ converte e valida
    if (!Number.isInteger(idNum)) {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const user = await User.findById(idNum);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado." });

    return res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}
