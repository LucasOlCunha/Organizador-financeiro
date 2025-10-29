// This file intentionally exports the configured Express app without starting a server.
// The actual server entrypoint is `app.js` which calls `app.listen(...)`.
import express from "express";
import pool from "./db.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(express.json());

// Health/test route (uses DB)
app.get("/teste", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco!");
  }
});

// Mount users routes
app.use("/users", usersRouter);

export default app;
