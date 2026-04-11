import HealthLog from "../models/healthLog.model.js";


export const getHealthHistory = async (req, res) => {
  try {

    const userId = req.user;

    const logs = await HealthLog
      .find({ userId }) // ⭐ user wise data
      .sort({ date: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};