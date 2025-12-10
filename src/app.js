import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import { prisma } from "./lib/prisma.js";
import categoriesRouter from "./routes/categories.js";
import transactionsRouter from "./routes/transactions.js";
import balanceRouter from "./routes/balance.js";
import reportsRouter from "./routes/reports.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Rota base
app.get("/", (req, res) => {
  res.send("Servidor rodando 🚀");
});

// Rota de teste que consulta o banco via Prisma
app.get("/teste", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco!");
  }
});

// Conecta as rotas de usuários
app.use("/users", usersRouter);
// Conecta as rotas de categorias
app.use("/categories", categoriesRouter);
// Conecta as rotas de transações
app.use("/transactions", transactionsRouter);
// Conecta as rotas de balanço
app.use("/balance", balanceRouter);
// Conecta as rotas de relatórios
app.use("/reports", reportsRouter);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
);

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  try {
    // Close HTTP server first
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
    // Disconnect Prisma
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
    console.log("Shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("beforeExit", () => shutdown("beforeExit"));
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  shutdown("uncaughtException");
});
