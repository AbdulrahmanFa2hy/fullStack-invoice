import mongoose from "mongoose"



export const dbConnection = () => {
    // mongoose.connect('mongodb://localhost:27017/invoiceee')
    mongoose.connect(process.env.DB_CONNECTION)
    .then( () => {
        console.log('Database connection successfully')
    })
    .catch((err) => {
        console.log('Database connection failed',err)
    })
}