import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";
import * as Category from "../models/category.js";
import * as CategoriesCtrl from "../controllers/categoriesController.js";

const router = express.Router();

// List all categories
// list (requires auth)
router.get("/", auth, CategoriesCtrl.listCategories);

// Get one category by id
router.get("/:id", auth, CategoriesCtrl.getCategory);

// Create category (protected)
router.post("/", auth, CategoriesCtrl.createCategory);

// Update category (protected)
router.patch("/:id", auth, CategoriesCtrl.updateCategory);

// Delete category (protected)
router.delete("/:id", auth, CategoriesCtrl.deleteCategory);

export default router;
