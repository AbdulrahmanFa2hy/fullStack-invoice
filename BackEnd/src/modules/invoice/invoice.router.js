
import express from "express";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    generateInvoicePdf, 
    sendInvoiceByWhatsApp 
} from "./invoice.controller.js";

const invoiceRouter = express.Router(); 

invoiceRouter.get('/:userId',protectedRoutes,allowedTo('user'),getAllInvoices)
invoiceRouter.get('/:id',getInvoiceById)
invoiceRouter.post('/',createInvoice)
invoiceRouter.put('/:id',protectedRoutes,allowedTo('admin','user'),updateInvoice)
invoiceRouter.delete('/:id',protectedRoutes,allowedTo('admin','user'),deleteInvoice)
invoiceRouter.get('/pdf/:id',generateInvoicePdf)
invoiceRouter.post('/:id/:phone',sendInvoiceByWhatsApp)

export default invoiceRouter;