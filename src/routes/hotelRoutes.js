const path = require('path');
const express = require('express');
const multer = require('multer');
const hotelController=require('../controllers/hotelController')
const router = express.Router();
const storage = multer.diskStorage({});
const upload = multer({
    storage: storage,
    // limits:{fileSize:500000}
  });
  router.use(express.static('public'));
  router.post('/signup', 
  upload.fields([
    { name: "hotelImages", maxCount: 4 },         // hotelImg1,2,3,4 as array of images     // video
    { name: "staffImages", maxCount: 10 },   // staff images
    { name: "ownerImages", maxCount: 4 },    // owner1,2,3,4 image
  ])
  , hotelController.hotelRegister);
  router.post('/getHotelName',hotelController.getHotelName)
  router.post('/loginWithOtp',hotelController.getOtp)
  router.post('/compareOtp',hotelController.compareOtp)
  router.get('/getRoomDetails/:id',hotelController.getRoomDetails)
  router.post('/addCustomerDetails/:id',hotelController.addCustomerDetails)
  router.get('/getCustomerDetails/:id',hotelController.getCustomerDetails)
  router.post('/deleteCustomerDetails/:id',hotelController.deleteCustomerDetails)
  router.post('/deletePersonalCustomerDetails/:id',hotelController.deletePersonalCustomerDetails)
  router.post('/updateCustomerDetails/:id',hotelController.updateCustomerDetails)
  router.post('/addCustomerDetailsAdvance/:id',hotelController.addCustomerDetailsAdvance)
  router.get('/getCustomerDetailsAdvance/:id',hotelController.getCustomerDetailsAdvance)
  router.post('/deleteCustomerDetailsAdvance/:id',hotelController.deleteCustomerDetailsAdvance)
  router.post('/updateCustomerDetailsAdvance/:id',hotelController.updateCustomerDetailsAdvance)
  router.post('/deleteReportCustomerDetails/:id',hotelController.deleteReportCustomerDetails)
  router.post('/updateMyProfile',upload.single("updateImg"),hotelController.updateMyProfile)
  router.post('/addStaff',upload.single("staffImg"),hotelController.addStaffDetails)
  module.exports = router;