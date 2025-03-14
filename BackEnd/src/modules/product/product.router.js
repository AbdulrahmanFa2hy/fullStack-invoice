import express from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, updateProduct, getProductsByUserId } from "./product.controller.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const productRouter = express.Router();

productRouter.get('/user/:userId', protectedRoutes, getProductsByUserId);

productRouter.post('/',protectedRoutes,allowedTo('admin', 'user'),addProduct)
productRouter.get('/',protectedRoutes,allowedTo('admin', 'user'),getAllProducts)
productRouter.get('/:id',getProductById)
productRouter.put('/:id',protectedRoutes,allowedTo('admin', 'user'),updateProduct)
productRouter.delete('/:id',protectedRoutes,allowedTo('admin', 'user'),deleteProduct)

export default productRouter;

