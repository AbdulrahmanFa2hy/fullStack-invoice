import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({

    invoice_number : {
        type:String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'company',
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'customer',
    },
    lastInvoiceDate: {
        type: Date,
    },
    total_amount: {
        type: Number,
    },
    description: {
        type: String,
        minLength: [3,"Description must be at least 3 characters long"],
        maxLength: [1000,"Description must be at most 30 characters long"]
    },
    invoiceHistory: [{
        invoice_id: {
            type: String,
        },
        total_amount: {
            type: Number,
        },
        invoice_date: {
            type: Date,
        },
    }],
    // currency: {
    //     type: String,
    //     enum: ['USD', 'EUR', 'GBP', 'EG', 'AUD'], 
    //     required: true

    // },
    // status: {
    //     type:String,
    //     enum: ['paid','notPaid'],
    //     default: 'paid'
    // },
   items : [{
       product_id : {
           type: mongoose.Schema.Types.ObjectId,
           ref : 'product',
       },
       quantity : {
           type: Number,
           required: true,
           min: [1, 'Product quantity must be at least 1']
       },
       price : {
           type: Number,
           required: true
       },
       name : {
           type: String,
           minLength: [3,"Product name must be at least 3 characters long"],
           maxLength: [30,"Product name must be at most 30 characters long'"],
           required: true
       }
   }],
   tax: {
    type: Number,
    min: [0, 'Tax must be greater than 0']
   },
   discount: {
       type: Number,
       min: [0, 'Discount must be greater than 0']
   },

   dailyCounter:{
    type: Number
   },
   type: {
    type: String,
   },
   notes: {
    type: String,
    minLength: [3,"Add notes must be at least 3 characters long"],
    maxLength: [1000,"Add notes must be at most 30 characters long'"]
   },
   privacy: {

    type: String,
    minLength: [3,"Conditions must be at least 3 characters long"],
    maxLength: [1000,"Conditions must be at most 30 characters long'"]
   }

},{timestamps:true})
export const invoiceModel = mongoose.model('invoice',invoiceSchema)