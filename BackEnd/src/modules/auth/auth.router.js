import express from "express";
import { signIn, signup, verifyToken } from "./auth.controller.js";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signIn);
authRouter.get("/verify", verifyToken);

export default authRouter;
