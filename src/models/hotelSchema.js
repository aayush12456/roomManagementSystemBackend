const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const staffSchema = require("./staffSchema");
const hotelSchema = mongoose.Schema({
    hotelName: {
        type: String,
        required: true,
        minLength: 3,
      },
      owner1: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        phone: {
          type: String,
          required: true,
          match: /^[0-9]{10}$/, // basic 10-digit phone validation
        },
        image: {
          type: String,
          required: true,
        },
      },
      owner2: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          match: /^[0-9]{10}$/, // basic 10-digit phone validation
        },
        image: {
          type: String,
        },
      },
      owner3: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          match: /^[0-9]{10}$/, // basic 10-digit phone validation
        },
        image: {
          type: String,
        },
      },
      owner4: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          match: /^[0-9]{10}$/, // basic 10-digit phone validation
        },
        image: {
          type: String,
        },
      },
      staff: {
        type: Map,
        of: staffSchema,
        required: true
      },
      hotelImg1:{
        type:String
      },
      hotelImg2:{
        type:String
      },
      hotelImg3:{
        type:String
      },
      hotelImg4:{
        type:String
      }
      
})
const hotelData = new mongoose.model("hotelData", hotelSchema);
module.exports=hotelData