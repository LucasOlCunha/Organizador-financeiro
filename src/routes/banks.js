import express from "express";
import auth from "../middleware/auth.js";
import * as BanksCtrl from "../controllers/banksController.js";

const router = express.Router();

// list (requires auth)
router.get("/", auth, BanksCtrl.listBanks);

router.get("/:id", auth, BanksCtrl.getBank);

router.post("/", auth, BanksCtrl.createBank);

router.put("/:id", auth, BanksCtrl.updateBank);

router.delete("/:id", auth, BanksCtrl.deleteBank);

export default router;
