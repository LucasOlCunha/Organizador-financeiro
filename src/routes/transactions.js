import express from "express";
import auth from "../middleware/auth.js";
import * as TransactionsCtrl from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/", auth, TransactionsCtrl.listTransactions);
router.get("/:id", auth, TransactionsCtrl.getTransaction);
router.post("/", auth, TransactionsCtrl.createTransaction);
router.put("/:id", auth, TransactionsCtrl.updateTransaction);
router.delete("/:id", auth, TransactionsCtrl.deleteTransaction);

export default router;
