const archiveOldNotesJob = () => {
  const runJob = async () => {
    try {
      const thresholdDate = new Date(Date.now() - THIRTY_DAYS);
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

  // Wait for mongoose to connect before starting
  if (mongoose.connection.readyState === 1) {
    runJob();
  } else {
    mongoose.connection.once("open", () => {
      runJob();
    });
  }

  setInterval(runJob, 24 * 60 * 60 * 1000); // Run every 24 hours
};
