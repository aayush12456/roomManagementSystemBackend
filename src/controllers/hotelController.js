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
    let ownerImagePublicIds = [];

    let hotelImageUrls=[]
    let hotelImagePublicIds = [];

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
      if (req.files && req.files.hotelImages) {
        for (const file of req.files.hotelImages) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'hotelImages'
          });
  
          if (!result || !result.secure_url) {
            throw new Error('Cloudinary image upload failed');
          }
  
          hotelImageUrls.push(result.secure_url);
          hotelImagePublicIds.push(result.public_id);
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
      hotelImg1: hotelImageUrls[0] || null,
      hotelImg1PublicId: hotelImagePublicIds[0] || null,
      hotelImg2: hotelImageUrls[1] || null,
      hotelImg2PublicId: hotelImagePublicIds[1] || null,
      hotelImg3: hotelImageUrls[2] || null,
      hotelImg3PublicId: hotelImagePublicIds[2] || null,
      hotelImg4: hotelImageUrls[3] || null,
      hotelImg4PublicId: hotelImagePublicIds[4] || null,
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
    const hotelName = String(req.body.hotelName || '').trim().toLowerCase();
    const hotelId = req.body.hotelId;

    // Single hotel find karo
    const matchHotel = await hotel.findById(hotelId);
    if (!matchHotel) {
      return res.status(404).send({ mssg: "Hotel not found" });
    }

    let isMatched = false;

    // Owners check karo
    if (matchHotel.owner1?.phone?.trim() === phone) isMatched = true;
    if (matchHotel.owner2?.phone?.trim() === phone) isMatched = true;
    if (matchHotel.owner3?.phone?.trim() === phone) isMatched = true;
    if (matchHotel.owner4?.phone?.trim() === phone) isMatched = true;

    // Staff check karo (staff1, staff2, ... unlimited)
    if (matchHotel.staff) {
      for (const staffMember of Object.values(matchHotel.staff)) {
        if (String(staffMember?.phone || '').trim() === phone) {
          isMatched = true;
          break;
        }
      }
    }

    // Hotel name bhi match karna hai
    const isHotelNameMatch =
      (matchHotel.hotelName || '').trim().toLowerCase() === hotelName;
console.log('is hotel match',isHotelNameMatch)
    if (isMatched || isHotelNameMatch) {
      // Yahi hotel match hai
      const token = await matchHotel.generateAuthToken();
      return res.status(200).send({
        mssg: "fetch data",
        matchedHotels: [matchHotel],
        token: token,
        phone: phone,
      });
    } else {
      return res.status(401).send({
        mssg: "No match found for given phone and hotelName",
      });
    }
  } catch (e) {
    console.error("CompareOtp error:", e);
    res.status(500).send({
      mssg: "comparison failed",
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

let signatureUrl = "";
    if (customerSignature) {
      const uploadResponse = await cloudinary.uploader.upload(customerSignature, {
        folder: "customer_signatures",
        resource_type: "image",
      });
      signatureUrl = uploadResponse.secure_url;
    }

console.log('customer signature',customerSignature)
console.log('customer signature url',signatureUrl)
const hotelDetails=await hotel.findOne({_id:hotelId})

hotelDetails.roomArray.push(
{roomId:roomId,roomType:roomType,currentDate:currentDate,floor:floor,roomNo:roomNo, customerName:customerName,customerAddress:customerAddress,customerPhoneNumber:customerPhoneNumber,
totalCustomer:totalCustomer, relation:relation ,customerIdProof:customerIdProof, customerAadharNumber:customerAadharNumber, customerCity:customerCity,customerOccupation:customerOccupation,customerDestination:customerDestination,reasonToStay:reasonToStay,
checkInDate:checkInDate,checkInTime:checkInTime,checkOutDate:checkOutDate,personalCheckOutTime:personalCheckOutTime,checkOutTime:checkOutTime,
totalPayment:totalPayment,paymentPaid:paymentPaid,paymentDue:paymentDue,frontDeskExecutiveName:frontDeskExecutiveName,
customerSignature: signatureUrl
})

hotelDetails.reportArray.push(
  {roomId:roomId,roomType:roomType,currentDate:currentDate,floor:floor,roomNo:roomNo, customerName:customerName,customerAddress:customerAddress,customerPhoneNumber:customerPhoneNumber,
  totalCustomer:totalCustomer, relation:relation, customerIdProof:customerIdProof,customerAadharNumber:customerAadharNumber,customerCity:customerCity,customerOccupation:customerOccupation,customerDestination:customerDestination,reasonToStay:reasonToStay,
  checkInDate:checkInDate,checkInTime:checkInTime,checkOutDate:checkOutDate,personalCheckOutTime:personalCheckOutTime,checkOutTime:checkOutTime,
  totalPayment:totalPayment,paymentPaid:paymentPaid,paymentDue:paymentDue,frontDeskExecutiveName:frontDeskExecutiveName,
  customerSignature: signatureUrl
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

exports.deleteCustomerDetails = async (req, res) => {
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
    res.status(200).send({
      mssg: "Customer details deleted successfully",
      getCustomerDetailsArray: updatedHotel.roomArray,
    });
  } catch (e) {
    console.error(e);
    res.status(401).send({ mssg: "Delete customer details failed" });
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
    const { hotelId, staffName: name, staffPhone: phone, staffAddress: address, staffPost: post } = req.body;
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
    res.status(200).send({
      mssg: "staff details",
     hotelObj:hotelObj,
     staff:staffObj,
     owner1:owner1,
     owner2:owner2,
     owner3:owner3,
     owner4:owner4
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

    if (!staffKey) {
      return res.status(404).send({ mssg: "Staff not found" });
    }

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
     owner4:owner4
  
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
    const image = req.file;
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
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ mssg: "Add Owner failed", error: e.message });
  }
};
