const Note = require("../models/Note");

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

const archiveOldNotesJob = () => {
  const runJob = async () => {
    const thresholdDate = new Date(Date.now() - THIRTY_DAYS);
    try {
      const result = await Note.updateMany(
        {
          archived: false,
          updatedAt: { $lt: thresholdDate, $ne: null },
        },
        { $set: { archived: true } }
      );

      console.log(
        `[Archive Job] Archived ${result.modifiedCount} notes older than 30 days`
      );
    } catch (error) {
      console.error("[Archive Job] Failed to archive notes:", error.message);
    }
  };

  // Run immediately on server start
  runJob();

  // Run every 24 hours (86400000 ms)
  setInterval(runJob, 24 * 60 * 60 * 1000);
};

module.exports = archiveOldNotesJob;
