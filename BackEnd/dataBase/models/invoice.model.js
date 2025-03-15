import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoice_number: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^(INV-\d{8}-\d{3}|#\d{3,})$/.test(v);
            },
            message: props => `${props.value} is not a valid invoice number format! Expected format: INV-YYYYMMDD-XXX or #XXX`
        }
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
    },
    items: [{
        name: String,
        description: String,
        quantity: Number,
        price: Number
    }],
    subtotal: Number,
    discount: Number,
    discountAmount: Number,
    tax: Number,
    taxAmount: Number,
    total: Number,
    type: String,
    privacy: String,
    notes: String,
    lastInvoiceDate: Date,
    dailyCounter: Number
}, { timestamps: true });

export const invoiceModel = mongoose.model('invoice', invoiceSchema);