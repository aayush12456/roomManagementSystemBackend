const cron = require("node-cron");
const Subscription=require("../models/subscriptionSchema")
const razorpay=require('../models/razorpay')

const startSubscriptionSyncJob = () => {
    console.log("✅ Subscription Sync Job Registered");
  
    // हर 30 मिनट में चलेगा
    cron.schedule("*/30 * * * *", async () => {
      try {
        console.log("🔄 Syncing Razorpay → MongoDB (SAFE MODE)");
  
        const now = Date.now();
  
        const all = await razorpay.subscriptions.all({ count: 100 });
  
        for (const s of all.items) {
          const expiry = s.current_end * 1000;
  
          let status;
  
          // 🔥 REAL SaaS logic (not Razorpay status)
          if (s.status === "cancelled") {
            status = "cancelled";
          } else if (expiry > now) {
            status = "active"; // service period still running
          } else {
            status = "expired"; // service period finished
          }
  
          await Subscription.findOneAndUpdate(
            { razorpaySubId: s.id },
            {
              status,
              startDate: new Date(s.current_start * 1000),
              endDate: new Date(expiry),
            }
          );
  
          console.log(`✔ ${s.id} → ${status}`);
        }
  
        console.log("✅ Razorpay → MongoDB sync completed safely");
      } catch (err) {
        console.error("❌ Sync failed:", err.message);
      }
    });
  };
  module.exports = startSubscriptionSyncJob;