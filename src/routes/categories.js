import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";
import * as Category from "../models/category.js";
import * as CategoriesCtrl from "../controllers/categoriesController.js";

const router = express.Router();

// list (requires auth)
router.get("/", auth, CategoriesCtrl.listCategories);

router.get("/:id", auth, CategoriesCtrl.getCategory);

router.post("/", auth, CategoriesCtrl.createCategory);

router.patch("/:id", auth, CategoriesCtrl.updateCategory);

router.delete("/:id", auth, CategoriesCtrl.deleteCategory);

export default router;
