import express from "express";
import auth from "../middleware/auth.js";
import * as UsersCtrl from "../controllers/usersController.js";

const router = express.Router();

/**
 * curl -Method POST -Body (@{email='seu@email.com';password='suaSenha'} | ConvertTo-Json) -ContentType 'application/json' http://localhost:3000/users/loginRota POST /users
 * Cria um usuário simples (sem criptografar a senha)
 */
router.post("/", UsersCtrl.createUser);

/**
 * Rota POST /users/register
 * Cria usuário com senha criptografada (registro mais seguro)
 */
router.post("/register", UsersCtrl.register);

/**
 * Rota GET /users
 * Retorna todos os usuários (campos públicos)
 */
router.get("/", UsersCtrl.listUsers);

/**
 * NOTE: dynamic id route moved to the end of the file to avoid capturing
 * static routes like /me. See below.
 */

/**
 * Rota POST /users/login
 * Autentica o usuário pelo email e senha
 */
router.post("/login", UsersCtrl.login);

/**
 * Rota GET /users/me
 * Retorna dados do usuário autenticado (protegida por JWT)
 */
router.get("/me", auth, UsersCtrl.me);

/**
 * Rota GET /users/:id
 * Retorna um usuário específico por id (sem senha)
 * Colocada por último para evitar conflitos com rotas estáticas (/me, /login ...)
 */
router.get("/:id", UsersCtrl.getById);

export default router;
