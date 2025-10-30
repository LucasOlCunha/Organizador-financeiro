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
    res.status(201).json(created);
  } catch (err) {
    console.error("Erro ao criar usuário:", err.message);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
}

export async function register(req, res) {
  // same as createUser but keeps the success message
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
    res
      .status(201)
      .json({ mensagem: "Usuário registrado com sucesso!", user: created });
  } catch (err) {
    console.error("Erro no registro:", err.message);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
}

export async function listUsers(req, res) {
  try {
    const result = (await User.findAll)
      ? await User.findAll()
      : await defaultListUsers();
    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err.message);
    res.status(500).json({ erro: "Erro ao buscar usuários." });
  }
}

async function defaultListUsers() {
  // fallback direct query (keeps compatibility if model missing findAll)
  throw new Error("findAll not implemented in user model");
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

    const userSafe = await User.findById(user.id);
    const secret = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: "1h" }
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ erro: "Erro ao efetuar login." });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado." });
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário autenticado:", err.message);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}

export async function getById(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado." });
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err.message);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
}
