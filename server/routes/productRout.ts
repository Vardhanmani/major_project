import express from "express";
import { createProduct, deleteProduct, getFlashDeals, getProductById, getProducts, updateProduct } from "../controllers/productControl.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const productRouter = express.Router();
productRouter.get("/flash-deals",getFlashDeals);
productRouter.get("/",getProducts);
productRouter.get("/:id",getProductById);
productRouter.get("/",auth,admin,createProduct);
productRouter.get("/:id",auth,admin,updateProduct);
productRouter.get("/:id",auth,admin,deleteProduct);

export default productRouter;