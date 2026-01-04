const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotelData",   // 🔥 same as your model name
      required: true,
      index: true
    },

    razorpaySubId: {
      type: String,
      required: true,
      unique: true
    },

    planId: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "expired",
        "completed"
      ],
      default: "created"
    },

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
