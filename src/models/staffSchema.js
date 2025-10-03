// models/staffSchema.js
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  image: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  imagePublicId: { type: String }
});

module.exports = staffSchema;
