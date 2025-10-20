import express from "express";
import usuariosRouter from "./routes/usuarios.js";

const app = express();
app.use(express.json());

app.use("/usuarios", usuariosRouter);

app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);
