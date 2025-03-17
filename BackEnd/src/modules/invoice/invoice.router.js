import express from "express";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
} from "./invoice.controller.js";

const invoiceRouter = express.Router(); 

invoiceRouter.get('/user/:userId', protectedRoutes, allowedTo('user'), getAllInvoices)
invoiceRouter.get('/:id', getInvoiceById)
invoiceRouter.post('/', createInvoice)
invoiceRouter.put('/:id', protectedRoutes, allowedTo('admin', 'user'), updateInvoice)
invoiceRouter.delete('/:id', protectedRoutes, allowedTo('admin', 'user'), deleteInvoice)

export default invoiceRouter; 