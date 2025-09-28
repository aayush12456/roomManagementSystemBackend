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
      hotelImg2: hotelImageUrls[1] || null,
      hotelImg3: hotelImageUrls[2] || null,
      hotelImg4: hotelImageUrls[3] || null,
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
        if (hotel.owner3 && hotel.owner3.phone === phone) {
          isMatched = true;
        }
        if (hotel.owner3 && hotel.owner3.phone === phone) {
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
console.log('phone in otp',phone)
const randomCode = generateRandomCode();
let message =  `Your Login OTP is ${randomCode}`;
await client.messages.create({
  body: message,
  from: '+15802093842',
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
res.status(200).send({mssg:'fetch data',matchedHotels:matchedHotels,token:token,phone:phone})
}catch(e){
  console.error(e);
  res.status(401).send({ mssg: 'comparison failed' });
}
}  

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
