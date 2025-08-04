// models/staffSchema.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true,
    trim: true,
  },
  bedType: {
    type: String,
    required: true,
  }
});

module.exports = roomSchema;
