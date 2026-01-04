const mongoose=require('mongoose')
const invoiceSchema = new mongoose.Schema({
  hotelId:String,
  subscriptionId: String,
  paymentId: String,   // ⭐ required
  amount: Number,
  currency: String,
  date: Date
}, { timestamps:true });

module.exports = mongoose.model("Invoice", invoiceSchema);
