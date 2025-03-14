import { productModel } from "../../../dataBase/models/product.model.js"
import { AppError } from "../../utils/AppError.js"
import { catchAsyncError } from "../../middleware/catchAsyncError.js"



const addProduct = catchAsyncError(async(req,res,next) => {

    const product  = new productModel(req.body)
    await product.save()
    if(!product) {
        return next (new AppError('Product not added',400))
    }
    res.status(200).json({message : 'Product added successfully',product})
})

const getAllProducts = catchAsyncError(async(req,res,next) => {

    let products = await productModel.find()
    if(!products) {
        return next (new AppError('Products not fetched',400))
    }
    res.status(200).json({message : 'Products fetched successfully',products})
})

const getProductById = catchAsyncError(async(req,res,next) => {
    const {id} = req.params
    let product = await productModel.findById(id)
    if(!product) {
        return next (new AppError('Product not fetched',400))
    }
    res.status(200).json({message : 'Product fetched successfully',product})

})

const updateProduct = catchAsyncError(async(req,res,next) => {

    const {id} = req.params
    let product = await productModel.findByIdAndUpdate(id,req.body,{new : true})
    if(!product) {
        return next (new AppError('Product not updated',400))
    }
    res.status(200).json({message : 'Product updated successfully',product})
})

const deleteProduct = catchAsyncError(async(req,res,next) => {

    const {id} = req.params
    let product = await productModel.findByIdAndDelete(id)
    if(!product) {
        return next (new AppError('Product not deleted',400))
    }
    res.status(200).json({message : 'Product deleted successfully',product})
})

const getProductsByUserId = catchAsyncError(async(req,res,next) => {
    const { userId } = req.params;
    
    try {
        // Check if the user is authorized to access these products
        if (req.user._id.toString() !== userId) {
            return next(new AppError('Unauthorized access to products', 403));
        }
        
        // Find products for this user
        let products = await productModel.find({ user_id: userId });
        
        // Return the products
        res.status(200).json({ 
            message: 'Products fetched successfully', 
            products: products || [] 
        });
    } catch (error) {
        return next(new AppError(`Error fetching products: ${error.message}`, 500));
    }
});

export {addProduct,getAllProducts,getProductById,updateProduct,deleteProduct,getProductsByUserId}