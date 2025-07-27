const hotel=require('../models/hotelSchema')
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
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
  