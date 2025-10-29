import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * curl -Method POST -Body (@{email='seu@email.com';password='suaSenha'} | ConvertTo-Json) -ContentType 'application/json' http://localhost:3000/users/loginRota POST /users
 * Cria um usuário simples (sem criptografar a senha)
 */
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios." });
  }

  try {
    // Verifica se o email já existe
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    // Criptografa a senha antes de salvar (evita gravar em texto puro)
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, data_criacao",
      [name, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao inserir usuário:", error.message);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});

/**
 * Rota POST /users/register
 * Cria usuário com senha criptografada (registro mais seguro)
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios." });
  }

  try {
    // Verifica se o email já existe
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere no banco
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, data_criacao",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      mensagem: "Usuário registrado com sucesso!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erro no registro:", error.message);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
});

/**
 * Rota GET /users
 * Retorna todos os usuários (campos públicos)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, data_criacao FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error.message);
    res.status(500).json({ erro: "Erro ao buscar usuários." });
  }
});

/**
 * NOTE: dynamic id route moved to the end of the file to avoid capturing
 * static routes like /me. See below.
 */

/**
 * Rota POST /users/login
 * Autentica o usuário pelo email e senha
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: "Preencha email e senha." });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password, data_criacao FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    // Não retornar a senha
    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      data_criacao: user.data_criacao,
    };

    // Gera JWT
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
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(500).json({ erro: "Erro ao efetuar login." });
  }
});

/**
 * Rota GET /users/me
 * Retorna dados do usuário autenticado (protegida por JWT)
 */
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, name, email, data_criacao FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error.message);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
});

/**
 * Rota GET /users/:id
 * Retorna um usuário específico por id (sem senha)
 * Colocada por último para evitar conflitos com rotas estáticas (/me, /login ...)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, name, email, data_criacao FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.message);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
});

export default router;
