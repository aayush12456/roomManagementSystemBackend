const Razorpay=require('razorpay')
 const razorpay = new Razorpay({
  //test key
    key_id:"rzp_test_RzIR2c4u7D5T00",
    key_secret:"w0zmYzvf3ecsbRLxqmhBbLQT"

    //live keys
    // key_id:"rzp_live_S9NrL4vhEbFG4M",
    // key_secret:"v16XvrWVYAlVE0I4Ay8vgNJ0"
  });
  module.exports = razorpay;