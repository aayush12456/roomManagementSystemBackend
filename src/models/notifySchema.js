const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotelData",
    required: true
  },
  name: {
    type: String
  },
  roomNo: {
    type: String
  },
  message: {
    type: String
  },
  imgUrl: {
    type: String
  },
  floorName:{
    type:String
  },
  personName:{
type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔥 TTL (auto delete after 2 min / 300 sec)
notifySchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 });

module.exports = mongoose.model("notifyMessage", notifySchema);
