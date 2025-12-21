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
      hotelAddress: {
        type: String,
        required: true,
        minLength: 3,
        unique:true
      },
      hotelRegistrationNumber: {
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
        address: {
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
        imagePublicId: { type: String }
      },
      owner2: {
        name: {
          type: String,
          trim: true,
        },
        address: {
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
        imagePublicId: { type: String }
      },
      owner3: {
        name: {
          type: String,
          trim: true,
        },
        address: {
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
        imagePublicId: { type: String }
      },
      owner4: {
        name: {
          type: String,
          trim: true,
        },
        address: {
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
        imagePublicId: { type: String }
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
      hotelImg1PublicId: { type: String },
      hotelImg2PublicId: { type: String },
      hotelImg3PublicId: { type: String },
      hotelImg4PublicId: { type: String },

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
          relation:String,
          customerIdProof: String,
          customerAadharNumber:String,
          customerCity: String,
          customerOccupation: String,
          customerDestination: String,
          reasonToStay:String,
          checkInDate: String,
          checkInTime: String,
          checkOutDate: String,
          personalCheckOutTime:String,
          checkOutTime: String,
          totalPayment: String,
          paymentPaid:String,
          paymentDue:String,
          frontDeskExecutiveName: String,
          customerSignature:String,
          currentDate:String,
          imagePublicId:String ,
          extraCustomers: [
            {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
              },
              customerName: String,
              customerAddress: String,
              customerPhoneNumber: String,
              customerAadharNumber: String
            }
          ]
          
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
          relation:String,
          customerIdProof: String,
          customerAadharNumber:String,
          customerCity: String,
          customerOccupation: String,
          customerDestination: String,
          reasonToStay:String,
          checkInDate: String,
          checkInTime: String,
          checkOutDate: String,
          personalCheckOutTime:String,
          checkOutTime: String,
          totalPayment: String,
          paymentPaid:String,
          paymentDue:String,
          frontDeskExecutiveName: String,
          customerSignature:String,
          currentDate:String,
          imagePublicId:String ,
          extraCustomers: [
            {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
              },
              extraCustomerLabel: String, 
              customerName: String,
              customerAddress: String,
              customerPhoneNumber: String,
              customerAadharNumber: String
            }
          ]
          
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
          totalPayment:String,
          advancePayment:String,
          frontDeskExecutiveName: String,
          todayDate:String,
          selectedDate:String,

        }
      ],
      profileArray:[
        {
          name: {
            type: String,
            trim: true,
          },
          image:{
            type:String
          },
          imagePublicId: { type: String },
          hotelName:{
            type: String,
            trim: true,
          },
          hotelId: { type: String },
          phone:{
            type:String
          },
          loginNumber:{
            type:String
          },
          anotherHotelId: { type: String },
          anotherNumber:{
            type:String
          },
        }
      ],
      maintainCleanRoom:[
        // {
        //   roomId: String,
        //   roomType:String,
        //   floor:String,
        //   roomNo:String,
        //   type:String,
        //   mainCleanerName:String
        // }
        {
          roomId:{
            type: String
          },
          roomType:{
            type: String
          },
          floor:{
            type: String
          },
          roomNo:{
            type: String
          },
          type:{
            type: String
          },
          mainCleanerName:{
            type: String
          },
          todayDate:{
            type: String
          },
        }
      ],
      notificationToken:[
        {
          token:{
            type: String
          },
          phone:{
            type: String
          }
        }
      ],
      notifyMessage: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "notifyMessage"
        }
      ]
      
      
      
},
{ strict: false }
)
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