const mongoose=require('mongoose')
// const dotenv=require('dotenv')
// dotenv.config()
// mongodbCompass local database configuration
mongoose.connect("mongodb://127.0.0.1/hotelManagementSystem").then(()=>{
    console.log("Database connected successfully")
}).catch(()=>{
    console.log("unable to connect ")
})

// MONGODB_CONNECT_URL yha mera production server ka url aayega jo ki .env me present hai
// mongoose.connect(process.env.MONGODB_CONNECT_URL,{
//     serverSelectionTimeoutMS: 5000, // Increase timeout
//     ssl: true, // Enable SSL
//     tlsAllowInvalidCertificates: true, 
//     family:4
// }).then(()=>{
//     console.log("Database connected successfully in production")
// }).catch((err)=>{
//     console.log("unable to connect ",err)
// })



