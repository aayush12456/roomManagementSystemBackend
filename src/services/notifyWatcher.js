const cron = require("node-cron");
const Hotel = require("../models/hotelSchema");
const Notify = require("../models/notifySchema");

function startNotifyCleanupJob() {

  console.log("⏳ Notify cleanup cron started…");

  // ⏱ Every 1 minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      console.log("🧹 Running notify cleanup...");

      // Get all valid notify IDs which still exist
      const existingIds = await Notify.find().distinct("_id");

      // Remove IDs from hotel.notifyMessage which no longer exist
      await Hotel.updateMany(
        {},
        { $pull: { notifyMessage: { $nin: existingIds } } }
      );

      console.log("✅ Notify cleanup completed");

    } catch (err) {
      console.error("❌ Cleanup job error:", err.message);
    }
  });
}

module.exports = startNotifyCleanupJob;
