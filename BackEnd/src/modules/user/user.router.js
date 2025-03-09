import express from "express";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "./user.controller.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

export const userRouter = express.Router();

userRouter.post("/", addUser);
userRouter.get("/", protectedRoutes, allowedTo("admin"), getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id", updateUser);
userRouter.delete(
  "/:id",
  protectedRoutes,
  allowedTo("admin", "user"),
  deleteUser
);
