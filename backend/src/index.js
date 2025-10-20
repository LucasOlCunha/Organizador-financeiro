const express = require("express");
const app = express();
const pool = require("./db");

app.get("/teste", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco!");
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
