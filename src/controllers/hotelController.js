const hotel=require('../models/hotelSchema')
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const twilio=require('twilio')
const cloudinary = require("cloudinary").v2;
const dotenv=require('dotenv')
dotenv.config()
const client = twilio(process.env.TWILIO_SID,process.env. TWILIO_AUTH_TOKEN);
cloudinary.config({ 
   cloud_name:'dpzvj9ubu',
   api_key:'432745627761171',
   api_secret:'YnrBTkdAPPz-AsnPEBkL1HfDfYA'
  });
  exports.hotelRegister = async (req, res) => {
    console.log('register data is',req.body)
    let cloudImageUrls = []
    let hotelImageUrls=[]
    let staffImageUrls=[]
    try{
      if (req.files && req.files.ownerImages) {
        for (const file of req.files.ownerImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ownerImages'
          });
  
          if (!result || !result.secure_url) {
            throw new Error('Cloudinary image upload failed');
          }
  
          cloudImageUrls.push(result.secure_url);
        }
      }
      if (req.files && req.files.hotelImages) {
        for (const file of req.files.hotelImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'hotelImages'
          });
  
          if (!result || !result.secure_url) {
            throw new Error('Cloudinary image upload failed');
          }
  
          hotelImageUrls.push(result.secure_url);
        }
      }

      if (req.files && req.files.staffImages) {
        for (const file of req.files.staffImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'staffImages'
          });
  
          if (!result || !result.secure_url) {
            throw new Error('Cloudinary image upload failed');
          }
  
          staffImageUrls.push(result.secure_url);
        }
      }
      if (req.body.owner1) {
        req.body.owner1 = typeof req.body.owner1 === 'string' ? JSON.parse(req.body.owner1) : req.body.owner1;
        req.body.owner1.image = cloudImageUrls[0] || null;
      }
      if (req.body.owner2) {
        req.body.owner2 = typeof req.body.owner2 === 'string' ? JSON.parse(req.body.owner2) : req.body.owner2;
        req.body.owner2.image = cloudImageUrls[1] || null;
      }
      if (req.body.owner3) {
        req.body.owner3 = typeof req.body.owner3 === 'string' ? JSON.parse(req.body.owner3) : req.body.owner3;
        req.body.owner3.image = cloudImageUrls[2] || null;
      }
      if (req.body.owner4) {
        req.body.owner4 = typeof req.body.owner4 === 'string' ? JSON.parse(req.body.owner4) : req.body.owner4;
        req.body.owner4.image = cloudImageUrls[3] || null;
      }

      const staffMap = new Map();
  
      Object.entries(req.body).forEach(([key, value]) => {
        if (key.startsWith('staff')) {
          let staffData = typeof value === 'string' ? JSON.parse(value) : value;
          let staffIndex = parseInt(key.replace('staff', '')) - 1;
  
          if (!isNaN(staffIndex)) {
            staffData.image = staffImageUrls[staffIndex] || null;
          } else {
            staffData.image = null;
          }
  
          staffMap.set(key, staffData);
        }
      });
  
      // Convert Map to plain object for MongoDB storage
      const staffObject = {};
      staffMap.forEach((value, key) => {
        staffObject[key] = value;
      });
    const hotelData=new hotel({
      hotelName:req.body.hotelName,
      owner1:req.body.owner1,
      owner2:req.body.owner2,
      owner3:req.body.owner3,
      owner4:req.body.owner4,
      hotelImg1: hotelImageUrls[0] || null,
      hotelImg2: hotelImageUrls[1] || null,
      hotelImg3: hotelImageUrls[2] || null,
      hotelImg4: hotelImageUrls[3] || null,
      staff: staffObject,
    })
    await hotelData.save();
    console.log('hotelData',hotelData)
    res.status(201).send({ mssg: 'Data registered Successfully',registerData:hotelData});
    }catch (e) {
        console.error(e);
        res.status(401).send({ mssg: 'Data does not added' });
    }
  };
  exports.getHotelName = async (req, res) => {
    try {
      const phone = req.body.phone;
      const allHotels = await hotel.find().lean();
  
      const matchedHotelNames = [];
  
      allHotels.forEach(hotel => {
        let isMatched = false;
  
        // Check owner1
        if (hotel.owner1 && hotel.owner1.phone === phone) {
          isMatched = true;
        }
  
        // Check owner2
        if (hotel.owner2 && hotel.owner2.phone === phone) {
          isMatched = true;
        }
  
        // Check staff
        if (hotel.staff) {
          Object.values(hotel.staff).forEach(staffMember => {
            if (staffMember.phone === phone) {
              isMatched = true;
            }
          });
        }
  
        if (isMatched) {
          matchedHotelNames.push(hotel.hotelName || null); // null only if hotelName missing
        }
      });
  
      res.status(200).send({
        mssg: 'get hotel name',
        matchedNames: matchedHotelNames,
      });
  
    } catch (e) {
      console.error(e);
      res.status(401).send({ mssg: 'login failed' });
    }
  };
  const generateRandomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

exports.getOtp=async(req,res)=>{
try{
const phone=req.body.phone
const randomCode = generateRandomCode();
let message =  `Your Login OTP is ${randomCode}`;
await client.messages.create({
  body: message,
  from: '+16187496515',
  // from: '+16187496515', // Your Twilio phone number
  to: '+91' + phone, // User's phone number
});
res.status(201).send({
  mssg: 'otp send Successfully',
  otp: randomCode,
  phoneNumber:phone,
});
}catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'otp send failed' });
}
  }

exports.compareOtp=async(req,res)=>{
try{
const phone=req.body.phone
const hotelName=req.body.hotelName
const allHotel=await hotel.find()
const matchedHotels = allHotel.filter(hotel => {
  return (
    (
      hotel.owner1?.phone === phone ||
      hotel.owner2?.phone === phone ||
      hotel.owner3?.phone === phone ||
      hotel.owner4?.phone === phone ||
      Object.values(hotel.staff || {}).some(staff => staff.phone === phone)
    )
    &&
    hotel.hotelName?.trim().toLowerCase() === hotelName?.trim().toLowerCase()
  );
});
const matchObj=matchedHotels[0]
const token = await matchObj.generateAuthToken();
res.status(200).send({mssg:'fetch data',matchedHotels:matchedHotels,token:token})
}catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'comparison failed' });
}
}  