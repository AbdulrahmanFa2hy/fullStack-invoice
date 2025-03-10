import express from "express";
import {
  saveCompany,
  getCompany,
  deleteCompany,
} from "./company.controller.js";
import { fileUpload } from "../../middleware/fileUploads.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";

export const companyRouter = express.Router();

// All routes require authentication
companyRouter.use(protectedRoutes);
companyRouter.use(allowedTo("user"));

// Company routes without userId parameter
companyRouter
  .route("/")
  .get(getCompany)
  .post(fileUpload("logo", "company"), saveCompany)
  .put(fileUpload("logo", "company"), saveCompany)
  .delete(deleteCompany);
