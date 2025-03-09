import { invoiceModel } from "../../../dataBase/models/invoice.model.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from "url";
import { dirname } from "path";
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';

// إعداد عميل WhatsApp مع التخزين المحلي للجلسة
const client = new Client({
    authStrategy: new LocalAuth()
});
let clientReady = false;

client.on('qr', (qr) => {
    qrcodeTerminal.generate(qr, { small: true });
    console.log('QR RECEIVED. Please scan the QR code.');
});

client.on('ready', () => {
    console.log('Client is ready!');
    clientReady = true; // تأكد من أن العميل جاهز
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();

//  all apis for invoices

const getAllInvoices = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
    let invoices = await invoiceModel.find({ user_id: userId}).populate('customer_id');

   if (!invoices || invoices.length === 0) {
    return next(new AppError('No invoices found for this user', 404));
}
    res.status(200).json({ message: "Invoices fetched successfully", invoices });
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
    const { user_id, invoice_id, items, tax, discount , notes , privacy } = req.body;
    if (!items || !invoice_id || !user_id || !Array.isArray(items)) {
        return next(new AppError("Missing required fields", 400));
    }

    // حساب المبلغ الإجمالي
    let total_amount = 0;

    for (const item of items) {
        const { product_id, quantity, price, name } = item;
        if (!product_id || !quantity || !price || !name) {
            return next(new AppError('Missing product details', 400));
        }
        total_amount += quantity * price;
    }
    if(tax) {
        total_amount -= discount;
    }
    if(discount) {
        total_amount -= discount;
    }
      // البحث عن الفاتورة السابقة الخاصة بالمستخدم
      const existingInvoice = await invoiceModel.findOne({ user_id });

      // إذا كانت هناك فاتورة سابقة، نضيف الفاتورة الجديدة إلى invoiceHistory
      if (existingInvoice) {
          existingInvoice.invoiceHistory.push({
              invoice_id: existingInvoice.invoice_id,
              total_amount: existingInvoice.total_amount,
              invoice_date: existingInvoice.createdAt
          });
          await existingInvoice.save();
      } else {
          // إذا لم يكن هناك فاتورة سابقة، يمكن إنشاء فاتورة جديدة مع invoiceHistory فارغ
          await invoiceModel.create({
              user_id,
              invoice_id,
              total_amount,
              items,
              tax,
              discount,
              notes,
              privacy,
              invoiceHistory: [] // بدءًا من مصفوفة فارغة
          });
      }
  
    const newInvoice = await invoiceModel.create({
        user_id,
        invoice_id,
        total_amount,
        items,
        discount,
        tax,
        notes,
        privacy
    });

    if (!newInvoice) {
        return next(new AppError('Invoice not added', 400));
    }

    res.status(200).json({ message: "Invoice added successfully", newInvoice });
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

// وظيفة لتوليد PDF
const generateInvoicePDF = (invoiceData, filePath) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Document settings
    doc.fontSize(20).text('Invoice Generator', { align: 'center' });
    doc.moveDown(1);

    // Invoice information
    doc.fontSize(14).text(`Date: ${invoiceData.lastInvoiceDate}`);
    doc.text(`Invoice #: ${invoiceData.invoice_id}`);
    doc.moveDown(1);

    doc.text('From:', { underline: true });
    doc.text(`Name: ${invoiceData.user_id.name}`);
    doc.text(`Email: ${invoiceData.user_id.email}`);
    doc.moveDown(1);

    // Product list
    doc.text('Products:', { underline: true });
    if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.items.forEach((item) => {
            doc.text(`${item.name} - ${item.quantity} x ${item.price} = ${item.quantity * item.price}`);
        });
    } else {
        doc.text('No products found.');
    }

    // Total amount
    doc.moveDown(1);
    doc.text(`Total: ${invoiceData.total_amount}`, { bold: true });

    // Add tax and discount if present
    if (invoiceData.tax) {
        doc.text(`Tax: ${invoiceData.tax}%`, { italic: true });
    }
    if (invoiceData.discount) {
        doc.text(`Discount: ${invoiceData.discount}`, { italic: true });
    }

    // Notes
    if (invoiceData.notes) {
        doc.moveDown(1);
        doc.text(`Notes: ${invoiceData.notes}`);
    }

    // Privacy conditions
    if (invoiceData.privacy) {
        doc.moveDown(1);
        doc.text(`Privacy Conditions: ${invoiceData.privacy}`);
    }

    doc.end();
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateInvoicePdf = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let invoice = await invoiceModel.findById(id).populate('user_id').populate('customer_id'); // Ensure user_id and customer_id are populated
    if (!invoice) {
        return next(new AppError('Invoice not fetched', 400));
    }

    const dirPath = path.join(__dirname, 'invoices'); // Define the directory path
    const filePath = path.join(dirPath, `${invoice.invoice_id}.pdf`);

    try {
        await fsPromises.mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.log('Error creating directory', error);
        return next(new AppError('Failed to create directory for invoice', 500));
    }

    generateInvoicePDF(invoice, filePath);
    
    // Send PDF as a response for download
    res.download(filePath, `${invoice.invoice_id}.pdf`, (err) => {
        if (err) {
            return next(new AppError('Failed to download the invoice', 500));
        }
    });
});

// وظيفة لإرسال الفاتورة عبر WhatsApp
const sendInvoiceByWhatsApp = catchAsyncError(async (req, res, next) => {
    const { id, phone } = req.params; // استقبال id ورقم الهاتف
    const invoice = await invoiceModel.findById(id).populate('customer_id');

    if (!invoice) {
        return next(new AppError('Invoice not found', 404));
    }

    const messageBody = `
    Invoice #: ${invoice.invoice_id}
    Date: ${invoice.invoice_date}
    Total Amount: ${invoice.total_amount} ${invoice.currency}
        Tax: ${invoice.tax ? invoice.tax + '%' : 'N/A'}
    Discount: ${invoice.discount ? invoice.discount : 'N/A'}
    Products: ${invoice.items.map(item => `${item.name} - ${item.quantity} x ${item.price} = ${item.quantity * item.price}`).join('\n')}
    Notes: ${invoice.notes || 'N/A'}
    Privacy Conditions: ${invoice.privacy || 'N/A'}
    `;

    if (!clientReady) {
        console.log('WhatsApp client is not ready');
        return next(new AppError('WhatsApp client is not ready', 500));
    }

    try {
        // إرسال PDF كملف مرفق
        await client.sendMessage(`whatsapp:${phone}`, {
            caption: messageBody, // نص الرسالة
            document: fs.readFileSync(path.join(__dirname, 'invoices', `${invoice.invoice_id}.pdf`)) // مسار ملف PDF
        });
        res.status(200).json({ message: "Invoice sent by WhatsApp successfully!" });
    } catch (error) {
        console.error(error);
        return next(new AppError("Failed to send invoice by WhatsApp", 500));
    }
});

export { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    generateInvoicePdf, 
    sendInvoiceByWhatsApp 
};