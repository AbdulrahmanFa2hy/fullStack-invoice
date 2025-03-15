import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

   name : {
       type : String,
       required : true,
       minLength : [3, 'Product name must be at least 3 characters long'],
       maxLength : [30, 'Product name must be at most 30 characters long']
   },

   description : {
    type: String
   },
    quantity: {
        type : Number,
        required : true,
    },

    price: {
        type : Number,
        required : true,
        min: [0, 'Product price must be greater than 0']
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    }

},{timestamps:true})
export const productModel = mongoose.model('product',productSchema)