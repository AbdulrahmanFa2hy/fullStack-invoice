import { invoiceModel } from "../../../dataBase/models/invoice.model.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";

//  all apis for invoices

const getAllInvoices = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
    
    try {
        // Populate both customer_id and company_id
        let invoices = await invoiceModel.find({ user_id: userId })
            .populate('customer_id')
            .populate('company_id')
            .sort({ createdAt: -1 });
        
        // Return empty array instead of error when no invoices found
        if (!invoices || invoices.length === 0) {
            return res.status(200).json({ 
                message: "No invoices found for this user", 
                invoices: [] 
            });
        }
        
        res.status(200).json({ 
            message: "Invoices fetched successfully", 
            invoices 
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(200).json({
            message: "Error fetching invoices", 
            invoices: []
        });
    }
});

const getInvoiceById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let invoice = await invoiceModel.findById(id).populate('customer_id');
    if (!invoice) {
        return next(new AppError('Invoice not fetched', 400));
    }
    res.status(200).json({ message: "Invoice fetched successfully", invoice });
}); 

const createInvoice = catchAsyncError(async (req, res, next) => {
    try {
        // Validate invoice number format
        const { invoice_number } = req.body;
        if (!/^(INV-\d{8}-\d{3}|#\d{3,})$/.test(invoice_number)) {
            return next(new AppError('Invalid invoice number format', 400));
        }

        // Create the invoice
        const invoice = await invoiceModel.create(req.body);
        
        // Populate any necessary fields
        await invoice.populate('customer_id company_id');
        
        // Send the response
        res.status(201).json({
            message: "Invoice created successfully",
            invoice: invoice
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        if (error.code === 11000) { // Duplicate key error
            return next(new AppError('Invoice number already exists', 409));
        }
        next(new AppError(error.message || 'Failed to create invoice', 500));
    }
});

const updateInvoice = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    let invoice = await invoiceModel.findByIdAndUpdate(id, req.body , { new: true });
    if (!invoice) {
        return next(new AppError('Invoice not updated', 400));
    }
    res.status(200).json({ message: "Invoice updated successfully", invoice });
});

const deleteInvoice = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let invoice = await invoiceModel.findByIdAndDelete(id);
    if (!invoice) {
        return next(new AppError('Invoice not deleted', 400));
    }
    res.status(200).json({ message: "Invoice deleted successfully", invoice });
});


export { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice
};