import express from "express";
import usersRouter from "./routes/users.js";
import pool from "./db.js";
import categoriesRouter from "./routes/categories.js";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow all origins
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// Rota base
app.get("/", (req, res) => {
  res.send("Servidor rodando 🚀");
});

// Rota de teste que consulta o banco
app.get("/teste", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco!");
  }
});

// Conecta as rotas de usuários
app.use("/users", usersRouter);
// Conecta as rotas de categorias
app.use("/categories", categoriesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
);
