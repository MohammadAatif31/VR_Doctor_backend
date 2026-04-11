import cron from "node-cron";
import User from "../models/user.model.js";

cron.schedule("0 0 * * *", async () => {

  const users = await User.find({ isPremium: true });

  for (const user of users) {

    if (user.premiumExpiry && new Date() > user.premiumExpiry) {

      if (user.autoRenew) {
        user.premiumExpiry = new Date(Date.now() + 30*24*60*60*1000);
      } else {
        user.isPremium = false;
      }

      await user.save();
    }
  }
}); 