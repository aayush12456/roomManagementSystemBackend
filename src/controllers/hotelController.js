const hotel=require('../models/hotelSchema')
const Notify = require("../models/notifySchema");
const Subscription=require("../models/subscriptionSchema")
const Invoice=require("../models/invoiceSchema")
const razorpay=require('../models/razorpay')
const crypto = require("crypto");

const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const twilio=require('twilio')
const cloudinary = require("cloudinary").v2;
const dotenv=require('dotenv')
const cron=require('cron')
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
    let ownerImagePublicIds = [];

    // let hotelImageUrls=[]
    // let hotelImagePublicIds = [];
    let hotelImageUrl = null;
    let hotelImagePublicId = null;

    let staffImageUrls=[]
    let staffImagePublicIds = [];

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
          ownerImagePublicIds.push(result.public_id);
        }
      }
      // if (req.files && req.files.hotelImages) {
      //   for (const file of req.files.hotelImages) {
      //     const result = await cloudinary.uploader.upload(file.path, {
      //       folder: 'hotelImages'
      //     });
  
      //     if (!result || !result.secure_url) {
      //       throw new Error('Cloudinary image upload failed');
      //     }
  
      //     hotelImageUrls.push(result.secure_url);
      //     hotelImagePublicIds.push(result.public_id);
      //   }
      // }
      if (req.files && req.files.hotelImage && req.files.hotelImage.length > 0) {
        const file = req.files.hotelImage[0];
      
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "hotelImages"
        });
      
        if (!result || !result.secure_url) {
          throw new Error("Cloudinary image upload failed");
        }
      
        hotelImageUrl = result.secure_url;
        hotelImagePublicId = result.public_id;
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
          staffImagePublicIds.push(result.public_id);
        }
      }
      if (req.body.owner1) {
        req.body.owner1 = typeof req.body.owner1 === 'string' ? JSON.parse(req.body.owner1) : req.body.owner1;
        req.body.owner1.image = cloudImageUrls[0] || null;
        req.body.owner1.imagePublicId=ownerImagePublicIds[0] || null
      }
      if (req.body.owner2) {
        req.body.owner2 = typeof req.body.owner2 === 'string' ? JSON.parse(req.body.owner2) : req.body.owner2;
        req.body.owner2.image = cloudImageUrls[1] || null;
        req.body.owner2.imagePublicId=ownerImagePublicIds[1] || null
      }
      if (req.body.owner3) {
        req.body.owner3 = typeof req.body.owner3 === 'string' ? JSON.parse(req.body.owner3) : req.body.owner3;
        req.body.owner3.image = cloudImageUrls[2] || null;
        req.body.owner3.imagePublicId=ownerImagePublicIds[2] || null
      }
      if (req.body.owner4) {
        req.body.owner4 = typeof req.body.owner4 === 'string' ? JSON.parse(req.body.owner4) : req.body.owner4;
        req.body.owner4.image = cloudImageUrls[3] || null;
        req.body.owner4.imagePublicId=ownerImagePublicIds[3] || null
      }

      const staffMap = new Map();
  
      Object.entries(req.body).forEach(([key, value]) => {
        if (key.startsWith('staff')) {
          let staffData = typeof value === 'string' ? JSON.parse(value) : value;
          let staffIndex = parseInt(key.replace('staff', '')) - 1;
  
          if (!isNaN(staffIndex)) {
            staffData.image = staffImageUrls[staffIndex] || null;
            staffData.imagePublicId=staffImagePublicIds[staffIndex] || null
          } else {
            staffData.image = null;
            staffData.imagePublicId=null
          }
  
          staffMap.set(key, staffData);
        }
      });
  
      // Convert Map to plain object for MongoDB storage
      const staffObject = {};
      staffMap.forEach((value, key) => {
        staffObject[key] = value;
      });

let roomObject = {};

if (req.body.roomData) {
  // Agar roomData string hai, toh use JSON me badal do
  const roomData = typeof req.body.roomData === 'string' 
    ? JSON.parse(req.body.roomData) 
    : req.body.roomData;

  // Har ek room ke liye loop chalao
  for (let roomName in roomData) {
    const roomDetails = roomData[roomName]; // Jaise: { roomType: 'Ac', bedType: 'Double Bed' }

    // Room name se floor ka naam nikaalo
    // "Ground Floor Room 1" → "Ground Floor"
    const floorName = roomName.split(" Room")[0];

    // Floor key banate hain (space hataake aur lowercase me)
    // "Ground Floor" → "groundfloor"
    const floorKey = floorName.toLowerCase().replace(/\s+/g, '');

    // Agar floor key pe koi value nahi hai, toh ek khaali object banao
    if (!roomObject[floorKey]) {
      roomObject[floorKey] = {};
    }

    // Ab us floor ke andar room ka data daal do
    roomObject[floorKey][roomName] = roomDetails;
  }
}

    const hotelData=new hotel({
      hotelName:req.body.hotelName,
      hotelAddress:req.body.hotelAddress,
      hotelRegistrationNumber:req.body.hotelRegistrationNumber,
      owner1:req.body.owner1,
      owner2:req.body.owner2,
      owner3:req.body.owner3,
      owner4:req.body.owner4,
      checkOutTime:req.body.checkOutTime,
      // hotelImg1: hotelImageUrls[0] || null,
      // hotelImg1PublicId: hotelImagePublicIds[0] || null,
      // hotelImg2: hotelImageUrls[1] || null,
      // hotelImg2PublicId: hotelImagePublicIds[1] || null,
      // hotelImg3: hotelImageUrls[2] || null,
      // hotelImg3PublicId: hotelImagePublicIds[2] || null,
      // hotelImg4: hotelImageUrls[3] || null,
      // hotelImg4PublicId: hotelImagePublicIds[4] || null,
      hotelImg: hotelImageUrl,
hotelImgPublicId: hotelImagePublicId,

      staff: staffObject,
      totalRoom:req.body.totalRoom,
      totalFloor:req.body.totalFloor,
      room: roomObject, 
    })
    await hotelData.save();
    console.log('hotelData',hotelData)
    res.status(201).send({ mssg: 'Data registered Successfully',registerData:hotelData});
    }catch (e) {
        console.error(e);
        res.status(401).send({ mssg: 'Data does not added' });
    }
  };
  // exports.getHotelName = async (req, res) => {
  //   try {
  //     const phone = req.body.phone;
  //     const allHotels = await hotel.find().lean();
  
  //     const matchedHotelNames = [];
  
  //     allHotels.forEach(hotel => {
  //       let isMatched = false;
  
  //       // Check owner1
  //       if (hotel.owner1 && hotel.owner1.phone === phone) {
  //         isMatched = true;
  //       }
  
  //       // Check owner2
  //       if (hotel.owner2 && hotel.owner2.phone === phone) {
  //         isMatched = true;
  //       }
  //       if (hotel.owner3 && hotel.owner3.phone === phone) {
  //         isMatched = true;
  //       }
  //       if (hotel.owner3 && hotel.owner3.phone === phone) {
  //         isMatched = true;
  //       }
  
  //       // Check staff
  //       if (hotel.staff) {
  //         Object.values(hotel.staff).forEach(staffMember => {
  //           if (staffMember.phone === phone) {
  //             isMatched = true;
  //           }
  //         });
  //       }
  
  //       if (isMatched) {
  //         matchedHotelNames.push(hotel.hotelName || null); // null only if hotelName missing

  //       }
  //     });
  
  //     res.status(200).send({
  //       mssg: 'get hotel name',
  //       matchedNames: matchedHotelNames,
  //     });
  
  //   } catch (e) {
  //     console.error(e);
  //     res.status(401).send({ mssg: 'login failed' });
  //   }
  // };


  const generateRandomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

exports.getHotelName = async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim(); // normalize
    const allHotels = await hotel.find().lean();

    const matchedHotelNames = [];

    allHotels.forEach(hotel => {
      let isMatched = false;

      // Check owners
      if (hotel.owner1?.phone?.trim() === phone) isMatched = true;
      if (hotel.owner2?.phone?.trim() === phone) isMatched = true;
      if (hotel.owner3?.phone?.trim() === phone) isMatched = true;
      if (hotel.owner4?.phone?.trim() === phone) isMatched = true;

      // Check staff
      if (hotel.staff) {
        Object.values(hotel.staff).forEach(staffMember => {
          if (String(staffMember?.phone || '').trim() === phone) {
            isMatched = true;
          }
        });
      }

      if (isMatched) {
        matchedHotelNames.push({
          hotelName: hotel.hotelName || null,
          hotelId: hotel._id.toString(),
          hotelImg:hotel.hotelImg
        });
      }
    });

    res.status(200).send({
      mssg: 'get hotel name',
      matchedNames: matchedHotelNames,
    });

  } catch (e) {
    console.error(e);
    res.status(401).send({ mssg: 'login failed', error: e.message });
  }
};

exports.getOtp=async(req,res)=>{
try{
const phone=req.body.phone
console.log('phone in otp',phone)
const randomCode = generateRandomCode();
let message =  `Your Login OTP is ${randomCode}`;
// await client.messages.create({
//   body: message,
//   from: '+15802093842',
//   to: '+91' + phone, // User's phone number
// });
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

// exports.compareOtp=async(req,res)=>{
// try{
// const phone=req.body.phone
// console.log('phone',phone)
// const hotelName=req.body.hotelName
// console.log('hotel name',hotelName)
// const hotelId=req.body.hotelId
// const allHotel=await hotel.find()
// const matchedHotels = allHotel.filter(hotel => {
//   console.log('hotel is compare',hotel)
//   return (
//     (
//       hotel.owner1?.phone === phone ||
//       hotel.owner2?.phone === phone ||
//       hotel.owner3?.phone === phone ||
//       hotel.owner4?.phone === phone ||
//       Object.values(hotel.staff || {}).some(staff => staff.phone === phone)
//     )
//     &&
//     hotel.hotelName?.trim().toLowerCase() === hotelName?.trim().toLowerCase()
//   );
// });
// console.log('match hotels',matchedHotels)
// const matchObj=matchedHotels[0]
// console.log('match obj',matchObj)
// const token = await matchObj.generateAuthToken();
// res.status(200).send({mssg:'fetch data',matchedHotels:matchedHotels,token:token,phone:phone})
// }catch(e){
//   console.error(e);
//   res.status(401).send({ mssg: 'comparison failed' });
// }
// }  



exports.compareOtp = async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const hotelId = req.body.hotelId;
    const anotherPhone = String(req.body.anotherPhone || '').trim();
    const anotherHotelId = req.body.anotherHotelId || '';

    // ---------- Step 1: Find main hotel ----------
    const matchHotel = await hotel.findById(hotelId);
    if (!matchHotel) {
      return res.status(404).send({ mssg: "Main hotel not found" });
    }

    const owners = ['owner1', 'owner2', 'owner3', 'owner4'];

    // ============ CASE 1: anotherHotelId & anotherPhone NOT provided ============
    if (!anotherHotelId || !anotherPhone) {
      console.log("Running single-hotel comparison logic...");

      // --- Check phone among all owners ---
      let matchedProfile = null;
      for (const ownerKey of owners) {
        const owner = matchHotel[ownerKey];
        if (owner && String(owner.phone || '').trim() === phone) {
          matchedProfile = {
            name: owner.name || '',
            phone: owner.phone || '',
            image: owner.image || '',
            imagePublicId: owner.imagePublicId || '',
            hotelName: matchHotel.hotelName || '',
            hotelId: matchHotel._id || '',
          };
          break;
        }
      }

      // --- If not found among owners, check staff ---
      if (!matchedProfile && matchHotel.staff && matchHotel.staff.size > 0) {
        for (const [key, staffMember] of matchHotel.staff.entries()) {
          if (String(staffMember?.phone || '').trim() === phone) {
            matchedProfile = {
              name: staffMember.name || '',
              phone: staffMember.phone || '',
              image: staffMember.image || '',
              imagePublicId: staffMember.imagePublicId || '',
              hotelName: matchHotel.hotelName || '',
              hotelId: matchHotel._id || '',
            };
            break;
          }
        }
      }

      if (!matchedProfile) {
        return res.status(404).send({ mssg: "No profile found for this phone" });
      }

      const token = await matchHotel.generateAuthToken();
      return res.status(200).send({
        mssg: "fetch data",
        matchedHotels: [matchHotel],
        token: token,
        phone: phone,
      });
    }

    // --- Prevent same hotel linking ---
    if (String(hotelId) === String(anotherHotelId)) {
      return res.status(400).send({
        mssg: "Login with existing account of same hotel name not possible",
      });
    }

    // ============ CASE 2: anotherHotelId & anotherPhone PROVIDED ============
    const anotherHotel = await hotel.findById(anotherHotelId);
    if (!anotherHotel) {
      return res.status(404).send({ mssg: "Another hotel not found" });
    }

    // ---------- Step 2: Find match in anotherHotel ----------
    let matchedProfileFromAnother = null;

    // --- Owners check ---
    for (const ownerKey of owners) {
      const owner = anotherHotel[ownerKey];
      if (owner && String(owner.phone || '').trim() === anotherPhone) {
        matchedProfileFromAnother = {
          name: owner.name || '',
          phone: owner.phone || '',
          image: owner.image || '',
          imagePublicId: owner.imagePublicId || '',
          hotelName: anotherHotel.hotelName || '',
          hotelId: anotherHotel._id || '',
        };
        break;
      }
    }

    // --- Staff check ---
    if (!matchedProfileFromAnother && anotherHotel.staff && anotherHotel.staff.size > 0) {
      for (const [key, staffMember] of anotherHotel.staff.entries()) {
        if (String(staffMember?.phone || '').trim() === anotherPhone) {
          matchedProfileFromAnother = {
            name: staffMember.name || '',
            phone: staffMember.phone || '',
            image: staffMember.image || '',
            imagePublicId: staffMember.imagePublicId || '',
            hotelName: anotherHotel.hotelName || '',
            hotelId: anotherHotel._id || '',
          };
          break;
        }
      }
    }

    // ---------- Step 3: Find match in matchHotel using phone ----------
    let matchedProfileFromMain = null;

    // --- Owners check ---
    for (const ownerKey of owners) {
      const owner = matchHotel[ownerKey];
      if (owner && String(owner.phone || '').trim() === phone) {
        matchedProfileFromMain = {
          name: owner.name || '',
          phone: owner.phone || '',
          image: owner.image || '',
          imagePublicId: owner.imagePublicId || '',
          hotelName: matchHotel.hotelName || '',
          hotelId: matchHotel._id || '',
        };
        break;
      }
    }

    // --- Staff check ---
    if (!matchedProfileFromMain && matchHotel.staff && matchHotel.staff.size > 0) {
      for (const [key, staffMember] of matchHotel.staff.entries()) {
        if (String(staffMember?.phone || '').trim() === phone) {
          matchedProfileFromMain = {
            name: staffMember.name || '',
            phone: staffMember.phone || '',
            image: staffMember.image || '',
            imagePublicId: staffMember.imagePublicId || '',
            hotelName: matchHotel.hotelName || '',
            hotelId: matchHotel._id || '',
          };
          break;
        }
      }
    }

    // ---------- Step 4: Cross-link profiles and save ----------
    if (matchedProfileFromAnother) {
      const profileForMain = {
        ...matchedProfileFromAnother,
        loginNumber: phone, // ✅ store main login phone in opposite profile
      };

      const existingProfiles = Array.isArray(matchHotel.profileArray)
        ? matchHotel.profileArray
        : [];

      const alreadyExists = existingProfiles.some(
        (p) => p.phone === profileForMain.phone && p.hotelId === profileForMain.hotelId
      );
      if (!alreadyExists) {
        matchHotel.profileArray.push(profileForMain);
        await matchHotel.save();
      }
    }

    if (matchedProfileFromMain) {
      const profileForAnother = {
        ...matchedProfileFromMain,
        loginNumber: anotherPhone, // ✅ store opposite phone
      };

      const existingProfiles = Array.isArray(anotherHotel.profileArray)
        ? anotherHotel.profileArray
        : [];

      const alreadyExists = existingProfiles.some(
        (p) => p.phone === profileForAnother.phone && p.hotelId === profileForAnother.hotelId
      );
      if (!alreadyExists) {
        anotherHotel.profileArray.push(profileForAnother); // ✅ Fixed: correct hotel updated
        await anotherHotel.save();                         // ✅ Fixed: correct save target
      }
    }

    // ---------- Step 5: Return final response ----------
    const token = await matchHotel.generateAuthToken();
    return res.status(200).send({
      mssg: "fetch data",
      matchedHotels: [matchHotel],
      token: token,
      phone: phone,
    });

  } catch (e) {
    console.error("CompareOtp error:", e);
    res.status(500).send({
      mssg: "Comparison failed",
      error: e.message,
    });
  }
};

exports.switchProfile=async(req,res)=>{
try{
const phone=req.body.phone
const hotelId=req.body.hotelId
const hotelName=req.body.hotelName
const hotelObj=await hotel.findById(hotelId)
const token = await hotelObj.generateAuthToken();
res.status(200).send({mssg:'fetch data',matchedHotels:[hotelObj],token:token,phone:phone})

}
catch(e){
  console.error("CompareOtp error:", e);
    res.status(500).send({
      mssg: "Comparison failed",
      error: e.message,
    });
}
}

exports.deleteSwitchProfile = async (req, res) => {
  try {
    const hotelId = req.body.hotelId;
    const phone = String(req.body.phone || '').trim();
    const anotherHotelId = req.body.anotherHotelId;
    console.log('another hotel id',anotherHotelId)
    const anotherPhone = String(req.body.anotherPhone || '').trim();

    // --- Validate ---
    if (!hotelId || !anotherHotelId || !phone || !anotherPhone) {
      return res.status(400).send({ mssg: "Missing required fields" });
    }

    const mainHotel = await hotel.findById(hotelId);
    if (!mainHotel) {
      return res.status(404).send({ mssg: "Main hotel not found" });
    }

    // ✅ Find the object that will be deleted
    const deletedObj = mainHotel.profileArray.find(
      (p) => p.loginNumber === phone && p.phone === anotherPhone
    );

    // console.log("Deleted object from main hotel:", deletedObj);


    // ---------- Step 1: Delete from main hotel's profileArray ----------
    const mainUpdate = await hotel.updateOne(
      { _id: hotelId },
      { $pull: { profileArray: { loginNumber: phone, phone: anotherPhone } } }
    );
    // ---------- Step 2: Delete from another hotel's profileArray ----------
    const anotherUpdate = await hotel.updateOne(
      { _id: anotherHotelId },
      { $pull: { profileArray: { loginNumber: anotherPhone, phone: phone } } }
    );

    // ---------- Step 3: Fetch updated docs ----------
    const updatedHotel = await hotel.findById(hotelId);
    const updatedAnotherHotel = await hotel.findById(anotherHotelId);

    // ---------- Step 4: Send response ----------
    return res.status(200).send({
      mssg: "Profile deleted successfully",
      hotelArray: updatedHotel.profileArray,
      deleteId:deletedObj._id
      // anotherHotelObj: updatedAnotherHotel,
    });

  } catch (e) {
    console.error("deleteSwitchProfile error:", e);
    res.status(500).send({
      mssg: "Deletion failed",
      error: e.message,
    });
  }
};

exports.getRoomDetails=async(req,res)=>{
try{
const id=req.params.id
console.log('id is',id)
const hotelObj=await hotel.findOne({_id:id})
res.status(200).send({mssg:'fetch data',hotelObj:hotelObj})
}

catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'comparison failed' });
}
}

exports.addCustomerDetails=async(req,res)=>{
  console.log('req in custm',req.body)
try{
const hotelId=req.params.id  
const roomId=req.body.roomId
const roomType=req.body.roomType
const floor=req.body.floor
const roomNo=req.body.roomNo
const currentDate=req.body.currentDate
const customerName=req.body.customerName
const customerAddress=req.body.customerAddress
const customerPhoneNumber=req.body.customerPhoneNumber
const totalCustomer=req.body.totalCustomer
const relation=req.body.relation
const customerIdProof=req.body.customerIdProof
const customerAadharNumber=req.body.customerAadharNumber
const customerCity=req.body.customerCity
const customerOccupation=req.body.customerOccupation
const customerDestination=req.body.customerDestination
const reasonToStay=req.body.reasonToStay
const checkInDate=req.body.checkInDate
const checkInTime=req.body.checkInTime
const checkOutDate=req.body.checkOutDate
const personalCheckOutTime=req.body.personalCheckOutTime
const checkOutTime=req.body.checkOutTime
const totalPayment=req.body.totalPayment
const paymentPaid=req.body.paymentPaid
const paymentDue=req.body.paymentDue
const frontDeskExecutiveName=req.body.frontDeskExecutiveName
const customerSignature=req.body.customerSignature
const extraCustomers = req.body.extraCustomers; // ✅ array aayega frontend se


let signatureUrl = "";
let imagePublicId = null;
    if (customerSignature) {
      const uploadResponse = await cloudinary.uploader.upload(customerSignature, {
        folder: "customer_signatures",
        resource_type: "image",
      });
      signatureUrl = uploadResponse.secure_url;
      imagePublicId = uploadResponse.public_id;
    }

console.log('customer signature',customerSignature)
console.log('customer signature url',signatureUrl)
const hotelDetails=await hotel.findOne({_id:hotelId})

hotelDetails.roomArray.push(
{roomId:roomId,roomType:roomType,currentDate:currentDate,floor:floor,roomNo:roomNo, customerName:customerName,customerAddress:customerAddress,customerPhoneNumber:customerPhoneNumber,
totalCustomer:totalCustomer, relation:relation ,customerIdProof:customerIdProof, customerAadharNumber:customerAadharNumber, customerCity:customerCity,customerOccupation:customerOccupation,customerDestination:customerDestination,reasonToStay:reasonToStay,
checkInDate:checkInDate,checkInTime:checkInTime,checkOutDate:checkOutDate,personalCheckOutTime:personalCheckOutTime,checkOutTime:checkOutTime,
totalPayment:totalPayment,paymentPaid:paymentPaid,paymentDue:paymentDue,frontDeskExecutiveName:frontDeskExecutiveName,
customerSignature: signatureUrl,imagePublicId:imagePublicId, extraCustomers: extraCustomers
})

hotelDetails.reportArray.push(
  {roomId:roomId,roomType:roomType,currentDate:currentDate,floor:floor,roomNo:roomNo, customerName:customerName,customerAddress:customerAddress,customerPhoneNumber:customerPhoneNumber,
  totalCustomer:totalCustomer, relation:relation, customerIdProof:customerIdProof,customerAadharNumber:customerAadharNumber,customerCity:customerCity,customerOccupation:customerOccupation,customerDestination:customerDestination,reasonToStay:reasonToStay,
  checkInDate:checkInDate,checkInTime:checkInTime,checkOutDate:checkOutDate,personalCheckOutTime:personalCheckOutTime,checkOutTime:checkOutTime,
  totalPayment:totalPayment,paymentPaid:paymentPaid,paymentDue:paymentDue,frontDeskExecutiveName:frontDeskExecutiveName,
  customerSignature: signatureUrl,imagePublicId:imagePublicId, extraCustomers: extraCustomers
  })
const data=await hotelDetails.save()
console.log('data us',data)
res.status(200).send({mssg:'add customers',getCustomerDetailsArray:hotelDetails.roomArray,reportArray:hotelDetails.reportArray})
}catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'customer addition failed' });
}
}

exports.getCustomerDetails=async(req,res)=>{
try{
const hotelId=req.params.id
const getCustomerDetails=await hotel.findOne({_id:hotelId})
res.status(200).send({mssg:'get customers',getCustomerDetailsArray:getCustomerDetails.roomArray,reportArray:getCustomerDetails.reportArray})
}catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'get customer details failed' });
}
}

// exports.deleteCustomerDetails = async (req, res) => {
//   try {
//     const hotelId = req.params.id;
//     const customerId = req.body.customerId;

//     const updatedHotel = await hotel.findByIdAndUpdate(
//       hotelId,
//       { $pull: { roomArray: { _id: customerId } } }, // directly remove
//       { new: true }
//     );

//     res.status(200).send({
//       mssg: "Customer details deleted successfully",
//       getCustomerDetailsArray: updatedHotel.roomArray,
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(401).send({ mssg: "Delete customer details failed" });
//   }
// };
exports.deleteCustomerDetails = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const customerId = req.body.customerId;

    // 1️⃣ Find hotel first
    const hotelObj = await hotel.findById(hotelId);
    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    // 2️⃣ Find the specific customer inside roomArray
    const customerData = hotelObj.roomArray.find(
      (item) => item._id.toString() === customerId
    );

    if (!customerData) {
      return res.status(404).send({ mssg: "Customer not found" });
    }

    // 3️⃣ Extract imagePublicId
    const imagePublicId = customerData.imagePublicId;

    // 4️⃣ Delete image from Cloudinary (if exists)
    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (err) {
        console.warn("⚠️ Cloudinary delete failed:", err.message);
      }
    }

    // 5️⃣ Delete customer from DB using $pull
    const updatedHotel = await hotel.findByIdAndUpdate(
      hotelId,
      { $pull: { roomArray: { _id: customerId } } },
      { new: true }
    );

    return res.status(200).send({
      mssg: "Customer details deleted successfully",
      getCustomerDetailsArray: updatedHotel.roomArray,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).send({ mssg: "Delete customer details failed" });
  }
};

// exports.updateCustomerDetails = async (req, res) => {
//   try {
//     const hotelId = req.params.id;
//     const roomId = req.body.roomId;
//     console.log('update room id',roomId)
//     const hotelDetails = await hotel.findOne({ _id: hotelId });
//     if (!hotelDetails) {
//       return res.status(404).send({ mssg: "Hotel not found" });
//     }

//     // jis customer ka _id match kare use find karo
//     const customer = hotelDetails.roomArray.find(
//       (c) => c.roomId === roomId
//     );

//     if (!customer) {
//       return res.status(404).send({ mssg: "Customer not found" });
//     }

//     // new details assign karo
//     Object.assign(customer, {
//       customerName: req.body.customerName,
//       customerAddress: req.body.customerAddress,
//       customerPhoneNumber: req.body.customerPhoneNumber,
//       totalCustomer: req.body.totalCustomer,
//       customerAadharNumber: req.body.customerAadharNumber,
//       customerCity: req.body.customerCity,
//       checkInDate: req.body.checkInDate,
//       checkInTime: req.body.checkInTime,
//       checkOutDate: req.body.checkOutDate,
//       checkOutTime: req.body.checkOutTime,
//       totalPayment: req.body.totalPayment,
//       paymentPaid: req.body.paymentPaid,
//       paymentDue: req.body.paymentDue,
//       frontDeskExecutiveName: req.body.frontDeskExecutiveName,
//     });

//     const reportCustomer = hotelDetails.reportArray.find(
//       (c) => c.roomId === roomId
//     );
//     console.log('report array find',reportCustomer)
//     if (!reportCustomer) {
//       return res.status(404).send({ mssg: "Customer not found" });
//     }
//     Object.assign(reportCustomer, {
//       customerName: req.body.customerName,
//       customerAddress: req.body.customerAddress,
//       customerPhoneNumber: req.body.customerPhoneNumber,
//       totalCustomer: req.body.totalCustomer,
//       customerAadharNumber: req.body.customerAadharNumber,
//       customerCity: req.body.customerCity,
//       checkInDate: req.body.checkInDate,
//       checkInTime: req.body.checkInTime,
//       checkOutDate: req.body.checkOutDate,
//       checkOutTime: req.body.checkOutTime,
//       totalPayment: req.body.totalPayment,
//       paymentPaid: req.body.paymentPaid,
//       paymentDue: req.body.paymentDue,
//       frontDeskExecutiveName: req.body.frontDeskExecutiveName,
//     });

//     await hotelDetails.save();

//     res.status(200).send({
//       mssg: "Customer details updated successfully",
//       getCustomerDetailsArray: hotelDetails.roomArray,reportArray:hotelDetails.reportArray
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(401).send({ mssg: "Update customer details failed" });
//   }
// };
exports.updateCustomerDetails = async (req, res) => {

  try {
    const hotelId = req.params.id;
    const roomId = req.body.roomId;
    console.log('update room id', roomId);

    const hotelDetails = await hotel.findOne({ _id: hotelId });
    if (!hotelDetails) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    // ✅ roomArray me jis jis ka roomId match kare, sab update karo
    hotelDetails.roomArray.forEach((customer) => {
      if (customer.roomId === roomId) {
        Object.assign(customer, {
          customerName: req.body.customerName,
          customerAddress: req.body.customerAddress,
          customerPhoneNumber: req.body.customerPhoneNumber,
          totalCustomer: req.body.totalCustomer,
          relation:req.body.relation,
          customerIdProof: req.body.customerIdProof,
          customerAadharNumber:req.body.customerAadharNumber,
          customerCity: req.body.customerCity,
          customerOccupation:req.body.customerOccupation,
          customerDestination:req.body.customerDestination,
           reasonToStay:req.body.reasonToStay,
          checkInDate: req.body.checkInDate,
          checkInTime: req.body.checkInTime,
          checkOutDate: req.body.checkOutDate,
          personalCheckOutTime:req.body.personalCheckOutTime,
          checkOutTime: req.body.checkOutTime,
          totalPayment: req.body.totalPayment,
          paymentPaid: req.body.paymentPaid,
          paymentDue: req.body.paymentDue,
          frontDeskExecutiveName: req.body.frontDeskExecutiveName,
          extraCustomers:req.body.extraCustomers
        });
      }
    });

    // ✅ reportArray me bhi same update
    hotelDetails.reportArray.forEach((reportCustomer) => {
      if (reportCustomer.roomId === roomId) {
        Object.assign(reportCustomer, {
          customerName: req.body.customerName,
          customerAddress: req.body.customerAddress,
          customerPhoneNumber: req.body.customerPhoneNumber,
          totalCustomer: req.body.totalCustomer,
          relation:req.body.relation,
          customerIdProof: req.body.customerIdProof,
          customerAadharNumber:req.body.customerAadharNumber,
          customerCity: req.body.customerCity,
          customerOccupation:req.body.customerOccupation,
          customerDestination:req.body.customerDestination,
           reasonToStay:req.body.reasonToStay,
          checkInDate: req.body.checkInDate,
          checkInTime: req.body.checkInTime,
          checkOutDate: req.body.checkOutDate,
          personalCheckOutTime:req.body.personalCheckOutTime,
          checkOutTime: req.body.checkOutTime,
          totalPayment: req.body.totalPayment,
          paymentPaid: req.body.paymentPaid,
          paymentDue: req.body.paymentDue,
          frontDeskExecutiveName: req.body.frontDeskExecutiveName,
          extraCustomers:req.body.extraCustomers
        });
      }
    });

    await hotelDetails.save();

    res.status(200).send({
      mssg: "Customer details updated successfully",
      getCustomerDetailsArray: hotelDetails.roomArray,
      reportArray: hotelDetails.reportArray,
    });
  } catch (e) {
    console.error(e);
    res.status(401).send({ mssg: "Update customer details failed" });
  }
};

exports.addCustomerDetailsAdvance=async(req,res)=>{
try{
const hotelId=req.params.id
const roomId=req.body.roomId
const roomType=req.body.roomType
const floor=req.body.floor
const roomNo=req.body.roomNo
const todayDate=req.body.todayDate
const selectedDate=req.body.selectedDate
const customerName=req.body.customerName
const customerAddress=req.body.customerAddress
const customerPhoneNumber=req.body.customerPhoneNumber
const totalPayment=req.body.totalPayment
const advancePayment=req.body.advancePayment
const frontDeskExecutiveName=req.body.frontDeskExecutiveName

const hotelDetails=await hotel.findOne({_id:hotelId})

hotelDetails.advanceRoomArray.push({roomId:roomId,roomType:roomType,floor:floor,todayDate:todayDate,selectedDate:selectedDate,
roomNo:roomNo,customerName:customerName,customerAddress:customerAddress, totalPayment:totalPayment,advancePayment:advancePayment,
customerPhoneNumber:customerPhoneNumber,frontDeskExecutiveName:frontDeskExecutiveName})
const hotelDetailData=await hotelDetails.save()
res.status(200).send({mssg:'add advance customers',getAdvanceCustomerDetailsArray:hotelDetailData.advanceRoomArray})
}catch (e) {
  console.error(e);
  res.status(401).send({ mssg: "add customer details advance failed" });
}
}

exports.getCustomerDetailsAdvance=async(req,res)=>{
  try{
  const hotelId=req.params.id
  const getAdvanceCustomerDetails=await hotel.findOne({_id:hotelId})
  res.status(200).send({mssg:'get advance customers',getAdvanceCustomerDetailsArray:getAdvanceCustomerDetails.advanceRoomArray})
  }catch(e){
    console.error(e);
    res.status(401).send({ mssg: 'get customer details failed' });
  }
  }

  exports.deleteCustomerDetailsAdvance = async (req, res) => {
    try {
      const hotelId = req.params.id;
      const customerId = req.body.customerId;
  
      const updatedHotel = await hotel.findByIdAndUpdate(
        hotelId,
        { $pull: {advanceRoomArray: { _id: customerId } } }, // directly remove
        { new: true }
      );
  
      if (!updatedHotel) {
        return res.status(404).send({ mssg: "Hotel not found" });
      }
  
      res.status(200).send({
        mssg: "Customer details deleted successfully",
        getAdvanceCustomerDetailsArray: updatedHotel.advanceRoomArray,
      });
    } catch (e) {
      console.error(e);
      res.status(401).send({ mssg: "Delete customer details failed" });
    }
  };
  

  exports.updateCustomerDetailsAdvance = async (req, res) => {
    try {
      const hotelId = req.params.id;
      const roomId = req.body.roomId;
      console.log('update room id',roomId)
      const hotelDetails = await hotel.findOne({ _id: hotelId });
      if (!hotelDetails) {
        return res.status(404).send({ mssg: "Hotel not found" });
      }
  
      // jis customer ka _id match kare use find karo
      const customer = hotelDetails.advanceRoomArray.find(
        (c) => c.roomId.toString() === roomId
      );
  
      if (!customer) {
        return res.status(404).send({ mssg: "Customer not found" });
      }
  
      // new details assign karo
      Object.assign(customer, {
        customerName: req.body.customerName,
        customerAddress: req.body.customerAddress,
        customerPhoneNumber: req.body.customerPhoneNumber,
        frontDeskExecutiveName: req.body.frontDeskExecutiveName,
      });
  
      const reportCustomer = hotelDetails.advanceRoomArray.find(
        (c) => c.roomId.toString() === roomId
      );
  
      if (!reportCustomer) {
        return res.status(404).send({ mssg: "Customer not found" });
      }
      Object.assign(reportCustomer, {
        customerName: req.body.customerName,
        customerAddress: req.body.customerAddress,
        customerPhoneNumber: req.body.customerPhoneNumber,
        frontDeskExecutiveName: req.body.frontDeskExecutiveName,
      });
  
      await hotelDetails.save();
  
      res.status(200).send({
        mssg: "Customer details advance updated successfully",
        getAdvanceCustomerDetailsArray: hotelDetails.advanceRoomArray,
      });
    } catch (e) {
      console.error(e);
      res.status(401).send({ mssg: "Update customer details failed" });
    }
  };
  exports.deleteReportCustomerDetails = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const customerId = req.body.customerId;

    const updatedHotel = await hotel.findByIdAndUpdate(
      hotelId,
      { $pull: { reportArray: { _id: customerId } } }, // directly remove
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }
    const io = req.app.locals.io;
    io.emit('updateCustomerDetails', {
      hotelId: hotelId,
      reportArray: updatedHotel.reportArray,
    });
    res.status(200).send({
      mssg: "Customer details deleted successfully",
      getCustomerDetailsArray: updatedHotel.reportArray,
    });
  } catch (e) {
    console.error(e);
    res.status(401).send({ mssg: "Delete customer details failed" });
  }
};

exports.deletePersonalCustomerDetails = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const customerId = req.body.customerId;

    const updatedHotel = await hotel.findByIdAndUpdate(
      hotelId,
      { $pull: { roomArray: { _id: customerId } } }, // directly remove
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }
    const io = req.app.locals.io;
    io.emit('updatePersonalCustomerDetails', {
      hotelId: hotelId,
      getCustomerDetailsArray: updatedHotel.roomArray,
    });
    res.status(200).send({
      mssg: "Customer details deleted successfully",
      getCustomerDetailsArray: updatedHotel.roomArray,
    });
  } catch (e) {
    console.error(e);
    res.status(401).send({ mssg: "Delete customer details failed" });
  }
};


// exports.updateMyProfile = async (req, res) => {
//   try {
//     console.log('body',req.body)
//     // const hotelId = req.body.id;
//     console.log('hotel id update',hotelId)
//     const { staffId,  address, post } = req.body || {};
//     const newImage = req.file; // assuming multer is used for single upload

//     const hotelObj = await hotel.findOne({ _id: hotelId });
//     console.log('hotel obj',hotelObj)
//     if (!hotelObj) {
//       return res.status(404).send({ mssg: "Hotel not found" });
//     }

//     let updated = false;

//     // ========== Case 1: Update Owner ==========
//     if (post === "Owner") {
//       for (let i = 1; i <= 4; i++) {
//         const key = `Owner${i}`;
//         const owner = hotelObj[key];
//         if (owner && owner.phone === phone) {
//           // update phone & address
//           if (req.body.newPhone) owner.phone = req.body.newPhone;
//           if (address) owner.address = address;

//           // update image if new provided
//           if (newImage) {
//             if (owner.image?.public_id) {
//               await cloudinary.uploader.destroy(owner.image.public_id);
//             }
//             const result = await cloudinary.uploader.upload(newImage.path, {
//               folder: "ownerImages",
//             });
//             owner.image = { url: result.secure_url, public_id: result.public_id };
//           }
//           updated = true;
//           break;
//         }
//       }
//     }

//     // ========== Case 2: Update Staff ==========
//     if (staffId) {
//       const staffMember = hotelObj.staffArray.find((st) => st._id.toString() === staffId);
//       if (staffMember) {
//         if (req.body.newPhone) staffMember.phone = req.body.newPhone;
//         if (address) staffMember.address = address;

//         if (newImage) {
//           if (staffMember.image?.public_id) {
//             await cloudinary.uploader.destroy(staffMember.image.public_id);
//           }
//           const result = await cloudinary.uploader.upload(newImage.path, {
//             folder: "staffImages",
//           });
//           staffMember.image = { url: result.secure_url, public_id: result.public_id };
//         }
//         updated = true;
//       }
//     }

//     if (!updated) {
//       return res.status(400).send({ mssg: "No matching owner/staff found to update" });
//     }

//     const updatedHotel = await hotelObj.save();

//     res.status(200).send({
//       mssg: "Profile updated successfully",
//       updatedData: updatedHotel,
//     });
//   } catch (e) {
//     console.error("Update error:", e);
//     res.status(500).send({ mssg: "Update customer profile failed", error: e.message });
//   }
// };


// exports.updateMyProfile = async (req, res) => {
//   try {
//     const hotelId=req.body.id
//     const phone=req.body.phone
//     const oldPhone=req.body.oldPhone
//     const address=req.body.address
//     const updateImg=req.body.updateImg
//   const staffId=req.body.staffId
//   const hotelObj = await hotel.findOne({ _id: hotelId });
//   console.log('hotel obj',hotelObj)
//     res.status(200).send({
//       mssg: "Profile updated successfully",
//       updatedData: req.body,
//     });
//   } catch (e) {
//     console.error("Update error:", e);
//     res.status(500).send({ mssg: "Update customer profile failed", error: e.message });
//   }
// };

//new
// exports.updateMyProfile = async (req, res) => {
//   console.log('body is',req.body)
//   try {
//     const hotelId = req.body.id;
//     const phone = req.body.phone;
//     const oldPhone = req.body.oldPhone;
//     const address = req.body.address;
//     const staffId=req.body.staffId
//     console.log('staff id',staffId)
//     const updateImg = req.file;
//     console.log('update img',updateImg)

//     const hotelObj = await hotel.findById(hotelId);
//     console.log('hotel obj',hotelObj)
//     if (!hotelObj) {
//       return res.status(404).send({ mssg: "Hotel not found" });
//     }

//     // Find matching owner by oldPhone
//     let updatedOwner = null;
//     for (let key of Object.keys(hotelObj.toObject())) {
//       if (key.startsWith("owner") && hotelObj[key]?.phone === oldPhone) {
//         updatedOwner = hotelObj[key]; // <-- return the full owner object
//         break;
//       }
//     }
// console.log('update owner',updatedOwner)
//     if (!updatedOwner) {
//       return res.status(404).send({ mssg: "Owner with oldPhone not found" });
//     }

//     // Upload new image if provided
//     if (updateImg) {
//       if (updatedOwner.imagePublicId) {
//         await cloudinary.uploader.destroy(updatedOwner.imagePublicId);
//         console.log("Old image deleted:", updatedOwner.imagePublicId);
//       }

//       const result = await cloudinary.uploader.upload(updateImg.path, {
//         folder: 'ownerImages'
//       });

//       if (!result || !result.secure_url) {
//         throw new Error('Cloudinary image upload failed');
//       }
//       console.log('result is',result.secure_url)
//       updatedOwner.image = result.secure_url; // update the owner image
//       updatedOwner.imagePublicId = result.public_id;
//     }
//      updatedOwner.address=address
//      updatedOwner.phone=phone
     
   
//     await hotelObj.save()
//     res.status(200).send({
//       mssg: "Profile updated successfully",
//       updatedData:hotelObj,
//       // updateImg:updatedOwner.image
//       oldPhone:oldPhone,
//       newPhone:phone

//     });
//   } catch (e) {
//     console.error("Update error:", e);
//     res.status(500).send({
//       mssg: "Update customer profile failed",
//       error: e.message,
//     });
//   }
// };
exports.updateMyProfile = async (req, res) => {
  console.log('body is', req.body);
  try {
    const hotelId = req.body.id;
    const phone = req.body.phone;
    const oldPhone = req.body.oldPhone;
    const address = req.body.address;
    const staffId = req.body.staffId;
    console.log('staff id', staffId);
    const updateImg = req.file;
    console.log('update img', updateImg);

    const hotelObj = await hotel.findById(hotelId);
    console.log('hotel obj', hotelObj);
    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    // ---------------- Staff update check ----------------
    if (staffId) {
      // staff Map ke andar iterate
      let matchedStaff = null;
      for (let [key, staff] of hotelObj.staff.entries()) {
        if (staff._id.toString() === staffId.toString()) {
          matchedStaff = staff;
          break;
        }
      }

      if (!matchedStaff) {
        return res.status(404).send({ mssg: "Staff with staffId not found" });
      }

      console.log("Matched Staff:", matchedStaff);

      // Agar update karna ho staff details bhi update kar do
      if (updateImg) {
        if (matchedStaff.imagePublicId) {
          await cloudinary.uploader.destroy(matchedStaff.imagePublicId);
          console.log("Old staff image deleted:", matchedStaff.imagePublicId);
        }

        const result = await cloudinary.uploader.upload(updateImg.path, {
          folder: "staffImages",
        });

        if (!result || !result.secure_url) {
          throw new Error("Cloudinary staff image upload failed");
        }

        matchedStaff.image = result.secure_url;
        matchedStaff.imagePublicId = result.public_id;
      }

      matchedStaff.address = address || matchedStaff.address;
      matchedStaff.phone = phone || matchedStaff.phone;

      await hotelObj.save();

      return res.status(200).send({
        mssg: "Staff profile updated successfully",
        updatedData:hotelObj,
        oldPhone: oldPhone,
        newPhone: phone,
      });
    }

    // ---------------- Owner update logic ----------------
    let updatedOwner = null;
    for (let key of Object.keys(hotelObj.toObject())) {
      if (key.startsWith("owner") && hotelObj[key]?.phone === oldPhone) {
        updatedOwner = hotelObj[key];
        break;
      }
    }

    console.log("update owner", updatedOwner);
    if (!updatedOwner) {
      return res.status(404).send({ mssg: "Owner with oldPhone not found" });
    }

    if (updateImg) {
      if (updatedOwner.imagePublicId) {
        await cloudinary.uploader.destroy(updatedOwner.imagePublicId);
        console.log("Old image deleted:", updatedOwner.imagePublicId);
      }

      const result = await cloudinary.uploader.upload(updateImg.path, {
        folder: "ownerImages",
      });

      if (!result || !result.secure_url) {
        throw new Error("Cloudinary image upload failed");
      }
      updatedOwner.image = result.secure_url;
      updatedOwner.imagePublicId = result.public_id;
    }

    updatedOwner.address = address;
    updatedOwner.phone = phone;

    await hotelObj.save();

    res.status(200).send({
      mssg: "Owner profile updated successfully",
      updatedData: hotelObj,
      oldPhone: oldPhone,
      newPhone: phone,
    });
  } catch (e) {
    console.error("Update error:", e);
    res.status(500).send({
      mssg: "Update profile failed",
      error: e.message,
    });
  }
};

// exports.addStaffDetails = async (req, res) => {
//   try{
// const hotelId=req.body.hotelId
// const name=req.body.staffName
// const phone=req.body.staffPhone
// const address=req.body.staffAddress
// const post=req.body.staffPost
// const image = req.file;
// const hotelObj=await hotel.findOne({_id:hotelId})
// console.log('hotel obj',hotelObj)
// if (!hotelObj) {
//   return res.status(404).send({ mssg: "Hotel not found" });
// }
// if(image){
//   const result = await cloudinary.uploader.upload(image.path, {
//     folder: "staffImages",
//   });

//   if (!result || !result.secure_url) {
//     throw new Error("Cloudinary staff image upload failed");
//   }
// }
// res.status(200).send({
//   mssg: "Owner profile updated successfully",

// });
//   }
//   catch (e) {
//     console.error("Update error:", e);
//     res.status(500).send({
//       mssg: "Update profile failed",
//       error: e.message,
//     });
//   }
// }


exports.addStaffDetails = async (req, res) => {
  try {
    const { hotelId, staffName: name, staffPhone: phone, staffAddress: address, 
      staffPost: post,imgUrl:imgUrl,message:message} = req.body;
    const image = req.file;
    // Find hotel
    const hotelObj = await hotel.findById(hotelId);
    if (!hotelObj) return res.status(404).send({ mssg: "Hotel not found" });
    console.log('hotel obj in staff',hotelObj)
    // Upload image to Cloudinary (if exists)
    let imageUrl = null;
    let imagePublicId = null;

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "staffImages",
      });

      if (!result || !result.secure_url) {
        throw new Error("Cloudinary staff image upload failed");
      }

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Staff object
    const staffData = {
      name,
      phone,
      address,
      post,
      image: imageUrl,
      imagePublicId,
    };

    // Initialize staff Map if not present
    if (!hotelObj.staff) {
      hotelObj.staff = new Map();
    }
    let nextIndex = 1;
    while (hotelObj.staff.has(`staff${nextIndex}`)) {
      nextIndex++;
    }
    const staffKey = `staff${nextIndex}`;

    // Add staff
    hotelObj.staff.set(staffKey, staffData);

    // Force Mongoose to track Map change
    hotelObj.markModified("staff");

    const notifyDoc = await Notify.create({
      hotelId,
      name:req.body.personName,
      personName:name,
      message,
      imgUrl
    });

    // 2️⃣ Store reference in hotel (same feeling as before)
    hotelObj.notifyMessage.push(notifyDoc._id);
    const notifyMessageArray=await Notify.find()
    // Save
    await hotelObj.save();
console.log('hotel obj in final',hotelObj)
    res.status(200).send({
      mssg: "Staff added successfully",
      hotelObj,
      staff: hotelObj.staff,
      owner1: hotelObj.owner1,
      owner2: hotelObj.owner2,
      owner3: hotelObj.owner3,
      owner4: hotelObj.owner4,
      notifyMessageArray:notifyMessageArray
    });
  } catch (e) {
    console.error("Add staff error:", e);
    res.status(500).send({
      mssg: "Add staff failed",
      error: e.message,
    });
  }
};

exports.getStaffPlusOwner=async(req,res)=>{
  try{
    const hotelId=req.params.id
    const hotelObj=await hotel.findOne({_id:hotelId})
    const staffObj=hotelObj.staff
    const owner1=hotelObj.owner1
    const owner2=hotelObj.owner2
    const owner3=hotelObj.owner3
    const owner4=hotelObj.owner4
    const notifyMessageArray=await Notify.find()
    res.status(200).send({
      mssg: "staff details",
     hotelObj:hotelObj,
     staff:staffObj,
     owner1:owner1,
     owner2:owner2,
     owner3:owner3,
     owner4:owner4,
     notifyMessageArray:notifyMessageArray
    });
  }
  catch(e){
    console.error(e);
    res.status(401).send({ mssg: 'get staff plus owner details failed' });
  }
}

exports.deleteStaffOwner = async (req, res) => {
  try {
    const hotelId = req.params.id;
    console.log('hotelid',hotelId)
    const staffId = req.body.staffId;
    const imgUrl=req.body.imgUrl
    const message=req.body.message
    
    
    // Find hotel
    const hotelObj = await hotel.findById(hotelId);
    if (!hotelObj) return res.status(404).send({ mssg: "Hotel not found" });
    console.log('obj hotel',hotelObj)

    // Convert Map to object
    const staffObj = Object.fromEntries(hotelObj.staff);

    // Find key where staffId matches
    const staffKey = Object.keys(staffObj).find(
      (key) => staffObj[key]._id.toString() === staffId
    );
    console.log('staff is ',staffKey)
    if (!staffKey) {
      return res.status(404).send({ mssg: "Staff not found" });
    }
    const staffName=staffObj[staffKey].name
    const imagePublicId = staffObj[staffKey].imagePublicId;
    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (err) {
        console.warn("⚠️ Cloudinary delete failed:", err.message);
      }
    }
    // Delete staff
    delete staffObj[staffKey];

    // Update back to Map and save
    hotelObj.staff = new Map(Object.entries(staffObj));
    const notifyDoc = await Notify.create({
      hotelId,
      name:req.body.personName,
      personName:staffName,
      message,
      imgUrl
    });

    // 2️⃣ Store reference in hotel (same feeling as before)
    hotelObj.notifyMessage.push(notifyDoc._id);
    const notifyMessageArray=await Notify.find()
    await hotelObj.save();

    const io = req.app.locals.io; // ✅ Access socket instance
    io.emit("getStaffOwnerObj", {
      mssg: "staff details",
      hotelObj,
      staff: hotelObj.staff,
      owner1: hotelObj.owner1,
      owner2: hotelObj.owner2,
      owner3: hotelObj.owner3,
      owner4: hotelObj.owner4,
    });


    const owner1=hotelObj.owner1
    const owner2=hotelObj.owner2
    const owner3=hotelObj.owner3
    const owner4=hotelObj.owner4
    const staffObjs=hotelObj.staff

    res.status(200).send({ 
    mssg: "staff details",
    hotelObj:hotelObj,
     staff:staffObjs,
     owner1:owner1,
     owner2:owner2,
     owner3:owner3,
     owner4:owner4,
     notifyMessageArray:notifyMessageArray
  
  });
  } catch (e) {
    console.error(e);
    res.status(500).send({ mssg: "Delete failed", error: e.message });
  }
};

exports.updateStaffProfile = async (req, res) => {
  try{
    const hotelId = req.body.hotelId;
    const name = req.body.staffName;
    const phone = req.body.staffPhone;
    const address = req.body.staffAddress;
    const post = req.body.staffPost;
    const staffId = req.body.staffId;
    const image = req.file;

    // Find hotel
    const hotelObj = await hotel.findOne({ _id: hotelId });
    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    if (staffId) {
      // staff Map ke andar iterate
      let matchedStaff = null;
      for (let [key, staff] of hotelObj.staff.entries()) {
        if (staff._id.toString() === staffId.toString()) {
          matchedStaff = staff;
          break;
        }
      }

      if (!matchedStaff) {
        return res.status(404).send({ mssg: "Staff with staffId not found" });
      }

      console.log("Matched Staff:", matchedStaff);

      // Agar update karna ho staff details bhi update kar do
      if (image) {
        if (matchedStaff.imagePublicId) {
          await cloudinary.uploader.destroy(matchedStaff.imagePublicId);
          console.log("Old staff image deleted:", matchedStaff.imagePublicId);
        }

        const result = await cloudinary.uploader.upload(image.path, {
          folder: "staffImages",
        });

        if (!result || !result.secure_url) {
          throw new Error("Cloudinary staff image upload failed");
        }

        matchedStaff.image = result.secure_url;
        matchedStaff.imagePublicId = result.public_id;
      }

      matchedStaff.address = address || matchedStaff.address;
      matchedStaff.phone = phone || matchedStaff.phone;
      matchedStaff.name = name || matchedStaff.name;
      matchedStaff.post = post || matchedStaff.post;

      await hotelObj.save();

      const owner1=hotelObj.owner1
      const owner2=hotelObj.owner2
      const owner3=hotelObj.owner3
      const owner4=hotelObj.owner4
      const staffObjs=hotelObj.staff
  

      return res.status(200).send({
        mssg: "staff details",
        hotelObj:hotelObj,
         staff:staffObjs,
         owner1:owner1,
         owner2:owner2,
         owner3:owner3,
         owner4:owner4
      });
    }
  }
  catch (e) {
    console.error(e);
    res.status(500).send({ mssg: "update staff profile failed", error: e.message });
  }
}


// exports.addOwner = async (req, res) => {
//   try{
// const hotelId=req.body.hotelId
// console.log('id in',hotelId)
// const name=req.body.ownerName
// const address=req.body.ownerAddress
// const phone=req.body.ownerPhone
// const image = req.file;
// let imageUrl = null;
// let imagePublicId = null;

// if (image) {
//   const result = await cloudinary.uploader.upload(image.path, {
//     folder: "ownerImages",
//   });

//   if (!result || !result.secure_url) {
//     throw new Error("Cloudinary staff image upload failed");
//   }

//   imageUrl = result.secure_url;
//   imagePublicId = result.public_id;
// }

// const hotelObj=await hotel.findOne({_id:hotelId})
// console.log('hotel obj in owner',hotelObj)
// if (!hotelObj) return res.status(404).send({ mssg: "Hotel not found" });
// const owners = Object.keys(hotelObj.toObject()).filter(k => k.startsWith("owner"));
//     if (owners.length >= 4) {
//       return res.status(400).send({ mssg: "Maximum 4 owners allowed" });
//     }

//     // Add next owner (like owner3, owner4)
//     const nextKey = `owner${owners.length + 1}`;
//     // let nextKey = null;
//     // for (let i = 1; i <= 4; i++) {
//     //   if (!hotelObj[`owner${i}`]) {
//     //     nextKey = `owner${i}`;
//     //     break;
//     //   }
//     // }
// if (!nextKey) {
//   return res.status(400).send({ mssg: "Maximum 4 owners allowed" });
// }
//     hotelObj[nextKey] = {
//       name:name,
//       address:address,
//       phone:phone,
//       image: imageUrl,
//       imagePublicId,
//     };

// await hotelObj.save();
// console.log('hotel is',hotelObj)
// const owner1=hotelObj.owner1
// const owner2=hotelObj.owner2
// const owner3=hotelObj.owner3
// const owner4=hotelObj.owner4


// const staffObjs=hotelObj.staff
// res.status(200).send({ 
//   mssg: "staff details",
//   hotelObj:hotelObj,
//   staff:staffObjs,
//   owner1:owner1,
//   owner2:owner2,
//   owner3:owner3,
//   owner4:owner4
// });
//   }
//   catch (e) {
//     console.error(e);
//     res.status(500).send({ mssg: "Delete failed", error: e.message });
//   }
// }


exports.addOwner = async (req, res) => {
  try {
    const hotelId = req.body.hotelId;
    const name = req.body.ownerName;
    const address = req.body.ownerAddress;
    const phone = req.body.ownerPhone;
    const image = req.file
    const imgUrl=req.body.imgUrl
    const message=req.body.message
    let imageUrl = null;
    let imagePublicId = null;

    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "ownerImages",
      });

      if (!result || !result.secure_url) {
        throw new Error("Cloudinary owner image upload failed");
      }

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const hotelObj = await hotel.findOne({ _id: hotelId });
    if (!hotelObj) return res.status(404).send({ mssg: "Hotel not found" });

    // Find next available owner slot
    let nextKey = null;
    for (let i = 1; i <= 4; i++) {
      const ownerData = hotelObj[`owner${i}`];
      if (
        !ownerData ||
        Object.keys(ownerData).length === 0 ||
        !ownerData.name
      ) {
        nextKey = `owner${i}`;
        break;
      }
    }

    if (!nextKey) {
      return res.status(200).send({
        mssg: "Maximum 4 owners already added — cannot add more",
        hotelObj,
      });
    }

    hotelObj[nextKey] = {
      name,
      address,
      phone,
      image: imageUrl,
      imagePublicId,
    };

    const notifyDoc = await Notify.create({
      hotelId,
      name:req.body.personName,
      personName:name,
      message,
      imgUrl
    });

    // 2️⃣ Store reference in hotel (same feeling as before)
    hotelObj.notifyMessage.push(notifyDoc._id);
    const notifyMessageArray=await Notify.find()
    await hotelObj.save();

    const { owner1, owner2, owner3, owner4, staff: staffObjs } = hotelObj;

    res.status(200).send({
      mssg: "staff details",
      hotelObj,
      staff: staffObjs,
      owner1,
      owner2,
      owner3,
      owner4,
      notifyMessageArray:notifyMessageArray
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ mssg: "Add Owner failed", error: e.message });
  }
};


exports.addRoom = async (req, res) => {
  try {
    const hotelId = req.body.hotelId;
    const { floor, roomType, bedType, roomNumber,name,imgUrl,message } = req.body;

    const hotelObj = await hotel.findOne({ _id: hotelId });
    console.log('hotel is',hotelObj.totalRoom)
    if (!hotelObj) return res.status(404).send({ mssg: "Hotel not found" });

    const room = hotelObj.room;
    const floorMap = room.get(floor);

    if (!floorMap) {
      return res.status(400).send({ mssg: "Invalid floor name" });
    }

    // ✅ Find how many rooms already exist in this floor
    const existingRoomsCount = floorMap.size;

    // ✅ Create new room key dynamically
    const formattedFloorName =
      floor
        .replace(/floor/i, " Floor") // "groundfloor" → "ground Floor"
        .replace(/^./, (c) => c.toUpperCase()); // Capitalize first letter → "Ground Floor"

    const newRoomKey = `${formattedFloorName} Room ${existingRoomsCount + 1}`;

    // ✅ Create new room object
    const newRoom = {
      roomType,
      bedType,
      number: roomNumber,
      _id: new mongoose.Types.ObjectId(),
    };

    // ✅ Add into the Map
    floorMap.set(newRoomKey, newRoom);

    // ✅ Save updated data
    hotelObj.room.set(floor, floorMap);
    // const currentTotal = parseInt(hotelObj.totalRooms || "0", 10);
    // hotelObj.totalRoom = String(currentTotal + 1);
    if (hotelObj.totalRoom !== undefined) {
      hotelObj.totalRoom = parseInt(hotelObj.totalRoom, 10) + 1;
    }

    // hotelObj.notifyMessage.push({name,imgUrl,message})
    const notifyDoc = await Notify.create({
      hotelId,
      name,
      roomNo: roomNumber,
      message,
      imgUrl
    });

    // 2️⃣ Store reference in hotel (same feeling as before)
    hotelObj.notifyMessage.push(notifyDoc._id);
    await hotelObj.save();

    res.status(200).send({
      mssg: "New room added successfully",
      matchedHotels: hotelObj,
      notifyMessageArray:hotelObj.notifyMessage
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ mssg: "Add room failed", error: e.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const hotelId = req.body.id;
    const { floor, floorId,name,imgUrl,message,roomNumber } = req.body;

    const hotelObj = await hotel.findOne({ _id: hotelId });

    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    // ✅ Get the Map of rooms for that floor
    const roomMap = hotelObj.room.get(floor);
    if (!roomMap) {
      return res.status(400).send({ mssg: "Invalid floor name" });
    }

    // ✅ Find the room key (like 'Ground Floor Room 3') by floorId
    let targetKey = null;
    for (const [key, roomObj] of roomMap.entries()) {
      if (roomObj._id?.toString() === floorId) {
        targetKey = key;
        break;
      }
    }

    if (!targetKey) {
      return res.status(404).send({ mssg: "Room not found for this floor" });
    }

    // ✅ Delete from Map
    roomMap.delete(targetKey);

    // ✅ Update the nested map back
    hotelObj.room.set(floor, roomMap);

    if (hotelObj.totalRoom !== undefined) {
      hotelObj.totalRoom = parseInt(hotelObj.totalRoom, 10) -1;
    }
    // ✅ Save the changes permanently

    const notifyDoc = await Notify.create({
      hotelId,
      name,
      roomNo:roomNumber,
      message,
      imgUrl
    });

    // 2️⃣ Store reference in hotel (same feeling as before)
    hotelObj.notifyMessage.push(notifyDoc._id);
    await hotelObj.save();

    return res.status(200).send({ 
      mssg: "Room deleted successfully", 
      matchedHotels: hotelObj,
      roomId:floorId,
      roomName:floor,
      notifyMessageArray:hotelObj.notifyMessage
    });

  } catch (e) {
    console.error("Error deleting room:", e);
    res.status(500).send({ mssg: "Delete room failed", error: e.message });
  }
};

// exports.addFloor = async (req, res) => {
//   try {
//     console.log("body is", req.body);

//     const hotelId = req.body.id;
//     // const name=req.body.name
//     // const imgUrl=req.body.image
//     // const message=req.body.message
//     // const floorName=req.body.floorName
//     const hotelObj = await hotel.findOne({ _id: hotelId });

//     if (!hotelObj) {
//       return res.status(404).send({ mssg: "Hotel not found" });
//     }

//     const room = hotelObj.room;
//     const bodyWithoutId = Object.keys(req.body).filter((key) => key !== "id");

//     if (bodyWithoutId.length === 0) {
//       return res.status(400).send({ mssg: "No floor data provided" });
//     }

//     // 🔹 Count total new rooms dynamically
//     let newRoomCount = 0;

//     // 🔹 Add floors and count rooms
//     bodyWithoutId.forEach((floorKey) => {
//       const floorData = req.body[floorKey];
//       const normalizedFloorName = floorKey.replace(/\s+/g, "").toLowerCase();

//       // Count rooms in this floor
//       const roomCount = Object.keys(floorData).length;
//       newRoomCount += roomCount;

//       // Add to the Map
//       room.set(normalizedFloorName, new Map(Object.entries(floorData)));
//     });

//     // 🔹 Increase totalRoom dynamically

//     hotelObj.totalRoom = ((parseInt(hotelObj.totalRoom) || 0) + newRoomCount).toString();
//     hotelObj.totalFloor = (
//       (parseInt(hotelObj.totalFloor) || 0) + bodyWithoutId.length
//     ).toString();

// //  const notifyDoc = await Notify.create({
// //       hotelId,
// //       name:name,
// //       message:message,
// //       imgUrl:imgUrl,
// //       floorName:floorName
// //     });

// //     hotelObj.notifyMessage.push(notifyDoc._id);
//     // 🔄 Save to DB
//     await hotelObj.save();

//     res.status(200).send({
//       mssg: "New Floor Added Successfully",
//       matchedHotels: hotelObj,
//       // notifyMessageArray:hotelObj.notifyMessage
//     });
//   } catch (e) {
//     console.error("Error adding floor:", e);
//     res.status(500).send({ mssg: "Error adding floor", error: e.message });
//   }
// };


exports.addFloor = async (req, res) => {
  try {
    console.log("body is", req.body);

    const {
      id: hotelId,
      name,
       imgUrl,
      message,
      floorName, // optional (sirf notify ke liye)
    } = req.body;

    const hotelObj = await hotel.findById(hotelId);
    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    const room = hotelObj.room;

    // ❗ Ye keys floor nahi hain — inko ignore karna hai
    const NON_FLOOR_KEYS = ["id", "name", "imgUrl", "message", "floorName"];

    let newRoomCount = 0;
    let newFloorCount = 0;

    // 🔹 Sirf actual floor objects process karo
    Object.keys(req.body).forEach((key) => {
      if (NON_FLOOR_KEYS.includes(key)) return;

      const floorData = req.body[key];

      // safety check
      if (typeof floorData !== "object" || Array.isArray(floorData)) return;

      const normalizedFloorName = key.replace(/\s+/g, "").toLowerCase();

      // room count
      const roomCount = Object.keys(floorData).length;
      newRoomCount += roomCount;
      newFloorCount += 1;

      // Map ke andar Map set karo (IMPORTANT)
      room.set(
        normalizedFloorName,
        new Map(Object.entries(floorData))
      );
    });

    // 🔹 totalRoom & totalFloor update
    hotelObj.totalRoom = (
      (parseInt(hotelObj.totalRoom, 10) || 0) + newRoomCount
    ).toString();

    hotelObj.totalFloor = (
      (parseInt(hotelObj.totalFloor, 10) || 0) + newFloorCount
    ).toString();

    // 🔔 Notification create (TTL enabled – auto delete after 24h)
    const notifyDoc = await Notify.create({
      hotelId,
      name,
      message,
      imgUrl,
     floorName
    });

    // 🔗 Hotel me sirf reference push karo
    hotelObj.notifyMessage.push(notifyDoc._id);

    // 💾 Save hotel
    await hotelObj.save();

    res.status(200).send({
      mssg: "New Floor Added Successfully",
      matchedHotels: hotelObj,
      notifyMessageArray: hotelObj.notifyMessage,
    });

  } catch (e) {
    console.error("Error adding floor:", e);
    res.status(500).send({
      mssg: "Error adding floor",
      error: e.message,
    });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    const { id, floorName , name,imgUrl, message} = req.body;

    const hotelObj = await hotel.findOne({ _id: id });
   let hotelId=id
    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    let room = hotelObj.room;

    // Check if room is a Map or normal object
    const isMap = room instanceof Map;

    console.log("Before delete floors:", isMap ? Array.from(room.keys()) : Object.keys(room));

    let floorExists = false;
    let deletedRoomCount = 0;

    if (isMap) {
      // ✅ If room is a Map
      if (room.has(floorName)) {
        const floorData = room.get(floorName);
        deletedRoomCount = floorData instanceof Map ? floorData.size : Object.keys(floorData).length;
        room.delete(floorName);
        floorExists = true;
      }
    } else {
      // ✅ If room is a normal JS object
      if (room[floorName]) {
        const floorData = room[floorName];
        deletedRoomCount = Object.keys(floorData).length;
        delete room[floorName];
        floorExists = true;
      }
    }

    if (!floorExists) {
      return res.status(404).send({ mssg: "Floor not found in this hotel" });
    }
    
    const currentTotalFloor = parseInt(hotelObj.totalFloor) || 0;
    const currentTotalRoom = parseInt(hotelObj.totalRoom) || 0;

    hotelObj.totalFloor = Math.max(currentTotalFloor - 1, 0).toString();
    hotelObj.totalRoom = Math.max(currentTotalRoom - deletedRoomCount, 0).toString();
    // Assign back and save
    hotelObj.room = room;
    
    const notifyDoc = await Notify.create({
      hotelId,
      name,
      message,
      imgUrl,
     floorName
    });

    // 🔗 Hotel me sirf reference push karo
    hotelObj.notifyMessage.push(notifyDoc._id);

    await hotelObj.save();

    console.log(
      "After delete floors:",
      isMap ? Array.from(hotelObj.room.keys()) : Object.keys(hotelObj.room)
    );

    res.status(200).send({
      mssg: "Floor deleted successfully",
      matchedHotels: hotelObj,
      floorName:floorName,
      notifyMessageArray: hotelObj.notifyMessage,

    });
  } catch (e) {
    console.error("Error delete floor:", e);
    res.status(500).send({ mssg: "Error deleting floor", error: e.message });
  }
};

exports.addMaintenanceCleanRoom = async (req, res) => {
try{
const hotelId=req.params.id
const floorName=req.body.floorName
const roomId=req.body.roomId
const roomNo=req.body.roomNo
const roomType=req.body.roomType
const type=req.body.type
const mainCleanerName=req.body.mainCleanerName
const todayDate=req.body.todayDate
const hotelObj = await hotel.findOne({ _id: hotelId });

    if (!hotelObj) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }
 const maintainCleanRoomArray=hotelObj.maintainCleanRoom
maintainCleanRoomArray.push({roomId:roomId,floorName:floorName,roomNo:roomNo,roomType:roomType,
  type:type,mainCleanerName:mainCleanerName,todayDate:todayDate})

const data=await hotelObj.save()
console.log('data us',data)
res.status(200).send({mssg:'maintainCleanRoom',maintainCleanRoom:data.maintainCleanRoom })
}catch(e){
  console.error("Error maintain cleaner room:", e);
  res.status(500).send({ mssg: "Error deleting floor", error: e.message });
}
}

exports.getMaintenanceCleanRoom=async(req,res)=>{
  try{
  const hotelId=req.params.id
  const getMaintainCleanRoom=await hotel.findOne({_id:hotelId})
  res.status(200).send({mssg:'maintainCleanRoom',maintainCleanRoom:getMaintainCleanRoom.maintainCleanRoom})
  }catch(e){
    console.error(e);
    res.status(401).send({ mssg: 'get customer details failed' });
  }
  }

  exports.deleteMaintenanceCleanRoom = async (req, res) => {
    try {
      const hotelId = req.params.id;
      const roomId = req.body.roomId;
  
      const updatedHotel = await hotel.findByIdAndUpdate(
        hotelId,
        { $pull: {maintainCleanRoom: { _id: roomId } } }, // directly remove
        { new: true }
      );
  
      if (!updatedHotel) {
        return res.status(404).send({ mssg: "Hotel not found" });
      }
  
      res.status(200).send({
        mssg: "maintainCleanRoom",
        maintainCleanRoom: updatedHotel.maintainCleanRoom,
      });
    } catch (e) {
      console.error(e);
      res.status(401).send({ mssg: "Delete room details failed" });
    }
  };
  

  exports.deleteHotel = async (req, res) => {
    try {
      const hotelId = req.body.id;
  
      // 1️⃣ FIND HOTEL
      const hotelObj = await hotel.findOne({ _id: hotelId });
      if (!hotelObj) {
        return res.status(404).send({ mssg: "Hotel not found" });
      }

      // 2️⃣ COLLECT ALL PUBLIC IDs TO DELETE FROM CLOUDINARY
      let allPublicIds = [];
  
      // ---- OWNER IMAGES ----
    
     if (hotelObj.owner1.imagePublicId) allPublicIds.push(hotelObj.owner1.imagePublicId);
     if (hotelObj.owner2.imagePublicId) allPublicIds.push(hotelObj.owner2.imagePublicId);
     if (hotelObj.owner3.imagePublicId) allPublicIds.push(hotelObj.owner3.imagePublicId);
     if (hotelObj.owner4.imagePublicId) allPublicIds.push(hotelObj.owner4.imagePublicId);
  
      // ---- STAFF IMAGES ----
    // ---- STAFF IMAGES FROM MONGOOSE MAP ----
if (hotelObj.staff instanceof Map) {
  hotelObj.staff.forEach((staffMember, key) => {
    if (staffMember?.imagePublicId) {
      allPublicIds.push(staffMember.imagePublicId);
    }
  });
}
if (Array.isArray(hotelObj.roomArray)) {
  hotelObj.roomArray.forEach((room) => {
    if (room?.imagePublicId) {
      allPublicIds.push(room.imagePublicId);
    }
  });
}
  
      // ---- HOTEL IMAGES ----
      if (hotelObj.hotelImg1PublicId) allPublicIds.push(hotelObj.hotelImg1PublicId);
      if (hotelObj.hotelImg2PublicId) allPublicIds.push(hotelObj.hotelImg2PublicId);
      if (hotelObj.hotelImg3PublicId) allPublicIds.push(hotelObj.hotelImg3PublicId);
      if (hotelObj.hotelImg4PublicId) allPublicIds.push(hotelObj.hotelImg4PublicId);
  
      // ---- CUSTOMER SIGNATURES FROM roomArray ----
      // hotelObj.roomArray?.forEach((room) => {
      //   if (room.customerSignaturePublicId) {
      //     allPublicIds.push(room.customerSignaturePublicId);
      //   }
      // });
  
      // // ---- CUSTOMER SIGNATURES FROM reportArray ----
      // hotelObj.reportArray?.forEach((room) => {
      //   if (room.customerSignaturePublicId) {
      //     allPublicIds.push(room.customerSignaturePublicId);
      //   }
      // });
  
      // // ---- ADVANCE ROOM CUSTOMER SIGNATURES if any ----
      // hotelObj.advanceRoomArray?.forEach((room) => {
      //   if (room.customerSignaturePublicId) {
      //     allPublicIds.push(room.customerSignaturePublicId);
      //   }
      // });
  
      // ---- PROFILE IMAGES ----
      // hotelObj.profileArray?.forEach((item) => {
      //   console.log('id is sd',item.publicId)
      //   if (item.imagePublicId) {
      //     allPublicIds.push(item.imagePublicId);
      //   }
      // });
  
  
      // 3️⃣ REMOVE DUPLICATES (safety)
      allPublicIds = [...new Set(allPublicIds)];
      console.log('all public',allPublicIds)

      const profileClean = await hotel.updateMany(
        {},
        {
          $pull: {
            profileArray: { hotelId: hotelId },
          },
        }
      );
      console.log("Profile removed from hotels:", profileClean.modifiedCount);
      // 4️⃣ DELETE FROM CLOUDINARY
      for (let id of allPublicIds) {
        await cloudinary.uploader.destroy(id);
      }
  
      // 5️⃣ DELETE HOTEL DOCUMENT FROM DB
      await hotel.deleteOne({ _id: hotelId });
  
      res.status(200).send({
        mssg: "Hotel deleted successfully",
        deletedImages:hotelObj 
      });
  
    } catch (e) {
      console.log(e);
      res.status(500).send({ mssg: "Delete hotel failed", error: e.message });
    } 
  };


  exports.updateHotelImage = async (req, res) => {
    try {
      const hotelId = req.body.id;
      const updateHotelImg = req.file;
  
      const hotelObj = await hotel.findById(hotelId);
      if (!hotelObj) {
        return res.status(404).send({ mssg: "Hotel not found" });
      }
  
      if (updateHotelImg) {
  
        // 1️⃣ delete old image
        if (hotelObj.hotelImgPublicId) {
          await cloudinary.uploader.destroy(hotelObj.hotelImgPublicId);
        }
  
        // 2️⃣ upload new image
        const result = await cloudinary.uploader.upload(updateHotelImg.path, {
          folder: "hotelImages",
        });
  
        // 3️⃣ update DB (guaranteed)
        await hotel.updateOne(
          { _id: hotelId },
          {
            hotelImg: result.secure_url,
            hotelImgPublicId: result.public_id,
          }
        );
      }
  
      const updated = await hotel.findById(hotelId);
  
      res.status(200).send({
        mssg: "Hotel Image updated successfully",
        updatedData: updated,
      });
  
    } catch (e) {
      res.status(500).send({
        mssg: "Update profile failed",
        error: e.message,
      });
    }
  };
  
  // exports.addNotifcationToken = async (req, res) => {
  //   try {
  //     const hotelId = req.params.id;
  //     const { notifyToken, phone } = req.body;
  
  //     const hotelObj = await hotel.findById(hotelId);
  //     if (!hotelObj) {
  //       return res.status(404).json({ msg: "Hotel not found" });
  //     }
  
  //     // ✅ prevent duplicate tokens
  //     // const alreadyExists = hotelObj.notificationToken.some(
  //     //   (item) => item.phone === phone
  //     // );
  
  //     // if (!alreadyExists) {
  //     //   hotelObj.notificationToken.push({
  //     //     token: notifyToken,
  //     //     phone,
  //     //   });
  //     // }
  //     hotelObj.notificationToken.push({
  //       token: notifyToken,
  //       phone,
  //     });
  //     await hotelObj.save();
  //   let finalNotifyArray=hotelObj.notificationToken.filter((item)=>item.token!==notifyToken)
  //     res.status(200).json({
  //       msg: "Notification token ",
  //       notifyTokenArray:finalNotifyArray,
  //     });
  //   } catch (e) {
  //     res.status(500).json({
  //       msg: "Failed to save notification token",
  //       error: e.message,
  //     });
  //   }
  // };
  exports.addNotifcationToken = async (req, res) => {
    try {
      const hotelId = req.params.id;
      const { notifyToken, phone } = req.body;
  
      const hotelObj = await hotel.findById(hotelId);
      if (!hotelObj) {
        return res.status(404).json({ msg: "Hotel not found" });
      }
  
      // 🔍 check if token already exists
      const alreadyExists = hotelObj.notificationToken.some(
        (item) => item.token === notifyToken
      );
  
      // ⛔ don't push duplicate
      if (!alreadyExists) {
        hotelObj.notificationToken.push({
          token: notifyToken,
          phone,
        });
        await hotelObj.save();
      }
      // let finalNotifyArray=hotelObj.notificationToken.filter((item)=>item.token!==notifyToken)
      // ⚠️ don't remove same token from response (your old filter did that)
      res.status(200).json({
        msg: alreadyExists
          ? "Token already exists — not added again"
          : "Notification token saved",
        notifyTokenArray:hotelObj.notificationToken,
      });
  
    } catch (e) {
      res.status(500).json({
        msg: "Failed to save notification token",
        error: e.message,
      });
    }
  };
  


  exports.getNotifcationToken=async(req,res)=>{
    try{
    const hotelId=req.params.id
    const hotelObj=await hotel.findOne({_id:hotelId})
    const token = req.query.token;
    let notifyArray
    notifyArray=hotelObj.notificationToken
   notifyArray=notifyArray.filter((item)=>item.token!==token)
    res.status(200).send({ msg: "Notification token",
    notifyTokenArray:notifyArray})
    }catch(e){
      console.error(e);
      res.status(401).send({ mssg: 'get customer details failed' });
    }
    }


    
    exports.getMessageNotify = async (req, res) => {
      try {
        const hotelId = new mongoose.Types.ObjectId(req.params.id);
    
        const hotelObj = await hotel
          .findById(hotelId)
          .populate({
            path: "notifyMessage",
            options: { sort: { createdAt: -1 } } // latest first (optional)
          })
          .select("notifyMessage");
    
        if (!hotelObj) {
          return res.status(404).send({ msg: "Hotel not found" });
        }
    
        res.status(200).send({
          msg: "Notification list",
          notifyMessageArray: hotelObj.notifyMessage // ✅ ARRAY OF OBJECTS
        });
    
      } catch (e) {
        console.error(e);
        res.status(500).send({ msg: "Get notification failed" });
      }
    };
    

    exports.deleteNotifcationToken = async (req, res) => {
      try {
        const hotelId = req.params.id;
        const notifyToken = req.body.notifyToken;
       const deadToken=req.body.deadToken
        // 1️⃣ Find hotel first
        const hotelObj = await hotel.findById(hotelId);
        if (!hotelObj) {
          return res.status(404).send({ mssg: "Hotel not found" });
        }
    
        if (Array.isArray(deadToken) && deadToken.length > 0) {

          await hotel.updateOne(
            { _id: hotelId },
            {
              $pull: {
                notificationToken: {
                  token: { $in: deadToken },
                },
              },
            }
          );
    
          // 🔥 AB FINAL LIST NIKAL KE YAHI RETURN KAR DO
          const finalHotel = await hotel.findById(hotelId).select("notificationToken");
    
          return res.status(200).send({
            mssg: "Dead tokens removed",
            notifyTokenArray: finalHotel.notificationToken,
          });
        }

        // 2️⃣ Find the specific customer inside roomArray
        const tokenData = hotelObj.notificationToken.find(
          (item) => item.token.toString() === notifyToken
        );
    
        if (!tokenData) {
          return res.status(404).send({ mssg: "token not found" });
        }
    
       
    
        // 5️⃣ Delete token from DB using $pull
        const updatedHotel = await hotel.findByIdAndUpdate(
          hotelId,
          { $pull: { notificationToken: { token: notifyToken } } },
          { new: true }
        );
    
        return res.status(200).send({
          mssg: "Notification token",
          notifyTokenArray: updatedHotel.notificationToken,
        });
    
      } catch (e) {
        console.error(e);
        return res.status(500).send({ mssg: "Delete customer details failed" });
      }
    };


    exports.createSubscription = async (req, res) => {
      try {
        const { planId } = req.body;
        const hotelId = req.params.id;
    
        if (!planId) return res.status(400).json({ msg: "planId missing" });
    
        const subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          total_count: 1,
          customer_notify: 1,
          notes: { hotelId }
        });
    
        res.json({
          msg: "Subscription created",
          subscription
        });
    
      } catch (err) {
        console.log(err);   // 🔥 error dikhega
        res.status(500).json({ error: err.error?.description || err.message });
      }
    };
    
    // exports.webhookHandler = async (req, res) => {

    //   const signature = req.headers["x-razorpay-signature"];
    
    //   const expected = crypto
    //     // .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    //     .createHmac("sha256","MY_HOTEL_SECRET")
    //     .update(req.body)
    //     .digest("hex");
    
    //   if (signature !== expected) {
    //     return res.status(400).send("Invalid signature");
    //   }
    
    //   const event = JSON.parse(req.body.toString());
    
    //   if (event.event === "subscription.activated") {
    //     const s = event.payload.subscription.entity;
    
    //     await Subscription.findOneAndUpdate(
    //       { razorpaySubId: s.id },
    //       {
    //         hotelId: s.notes.hotelId,
    //         planId: s.plan_id,
    //         status: s.status,
    //         startDate: new Date(s.start_at * 1000),
    //         endDate: new Date(s.end_at * 1000)
    //       },
    //       { upsert: true }
    //     );
    //   }
    
    //   res.json({ status: "ok" });
    // };
    exports.webhookHandler = async (req, res) => {
      try {
    
        const signature = req.headers["x-razorpay-signature"];
    
        const expected = crypto
          .createHmac("sha256", "MY_HOTEL_SECRET")
          .update(req.body)
          .digest("hex");
    
        if (signature !== expected) {
          console.log("❌ Invalid Signature");
          return res.status(400).send("Invalid signature");
        }
    
        const event = JSON.parse(req.body.toString());
    
        console.log("🚀 EVENT RECEIVED ===>", event.event);
    
        /* ================================
           🎯 STEP-1 — Subscription Save
        ==================================*/
        if (event.event === "subscription.activated") {
          const s = event.payload.subscription.entity;
    
          await Subscription.findOneAndUpdate(
            { razorpaySubId: s.id },
            {
              hotelId: s.notes?.hotelId || null,
              planId: s.plan_id,
              status: s.status,
              startDate: new Date(s.start_at * 1000),
              endDate: new Date(s.end_at * 1000)
            },
            { upsert: true }
          );
    
          console.log("✅ Subscription Saved / Updated");
        }
    
        /* ================================
           🎯 STEP-2 — INVOICE ONLY WHEN
           PAYMENT SUCCESS
        ==================================*/
        if (event.event === "payment.captured") {
          const p = event.payload.payment.entity;
    
          console.log("💰 PAYMENT OBJECT ===>");
          console.log(p);
          const rzpInvoice = await razorpay.invoices.fetch(p.invoice_id);

          const subscriptionId = rzpInvoice.subscription_id;
          try {
            // prevent duplicates
            const already = await Invoice.findOne({ paymentId: p.id });
            if (already) {
              console.log("⚠ Invoice Already Exists — Skipping");
            } else {
              const invoice = await Invoice.create({
                paymentId: p.id,
                hotelId: p.notes?.hotelId || null,
                subscriptionId:subscriptionId,
                amount: p.amount / 100,
                currency: p.currency,
                date: new Date()
              });
    
              console.log("🎉 Invoice Created ===>");
              console.log(invoice);
            }
          } catch (err) {
            console.log("❌ INVOICE SAVE ERROR ===>");
            console.log(err);
          }
        }
    
        return res.json({ status: "ok" });
    
      } catch (err) {
        console.log("💥 WEBHOOK ERROR ===>");
        console.log(err);
        return res.status(500).send("Webhook error");
      }
    };
    