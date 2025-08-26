const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const staffSchema = require("./staffSchema");
const roomSchema = require("./roomSchema");
const hotelSchema = mongoose.Schema({
    hotelName: {
        type: String,
        required: true,
        minLength: 3,
        unique:true
      },
      checkOutTime: {
        type: String,
        required: true,
        unique:true
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
      totalRoom: {
        type: String,
        required: true,
      },
      totalFloor: {
        type: String,
        required: true,
      },
      room: {
        type: Map,
        of: {
          type: Map,
          of: roomSchema,
        },
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
      },
      roomArray: [
        {
          roomId: String,
          roomType:String,
          floor:String,
          roomNo:String,
          customerName: String,
          customerAddress: String,
          customerPhoneNumber: String,
          totalCustomer: String,
          customerAadharNumber: String,
          customerCity: String,
          checkInDate: String,
          checkInTime: String,
          checkOutDate: String,
          checkOutTime: String,
          totalPayment: String,
          paymentPaid:String,
          paymentDue:String,
          frontDeskExecutiveName: String,
          customerSignature:String,
          currentDate:String
        }
        
      ],
      reportArray: [
        {
          roomId: String,
          roomType:String,
          floor:String,
          roomNo:String,
          customerName: String,
          customerAddress: String,
          customerPhoneNumber: String,
          totalCustomer: String,
          customerAadharNumber: String,
          customerCity: String,
          checkInDate: String,
          checkInTime: String,
          checkOutDate: String,
          checkOutTime: String,
          totalPayment: String,
          paymentPaid:String,
          paymentDue:String,
          frontDeskExecutiveName: String,
          customerSignature:String,
          currentDate:String
        }
        
      ],
      advanceRoomArray: [
        {
          roomId: String,
          roomType:String,
          floor:String,
          roomNo:String,
          customerName: String,
          customerAddress: String,
          customerPhoneNumber: String,
          frontDeskExecutiveName: String,

        }
        
      ],
})
hotelSchema.methods.generateAuthToken = async function () {
  try {
    console.log('toke data',this._id);
    // const token = jwt.sign(
    //   { _id: this._id.toString() },
    //   process.env.registerData,
    //   {
    //     expiresIn: 3600,
    //   }
    // );
    const token = jwt.sign(
        { _id: this._id.toString() },
        'hotelRegisterData',
        {
          expiresIn: 3600,
        }
      );
    return token;
  } catch (e) {
    res.status(400).send({ mssg: "token does not exist" });
  }
}
const hotelData = new mongoose.model("hotelData", hotelSchema);
module.exports=hotelData