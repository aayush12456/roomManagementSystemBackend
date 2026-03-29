// models/staffSchema.js
const mongoose = require("mongoose");

const accessSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    match: /^[0-9]{10}$/,
  },
   
  email: {
    type: String,
  },
  hotelId: {
    type: String,
  },
  hotelName: {
    type: String,
  },
  amount: {
    type: String,
  },
});

module.exports = mongoose.model("AccessSchema", accessSchema);
