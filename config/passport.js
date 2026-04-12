import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://vr-doctor-backend.onrender.com/bot/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        // user  → create
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: "google_auth_dummy", // safe dummy
          });

          await UserProfile.create({
            userId: user._id,
            name: user.name,
            photo:
              profile.photos?.[0]?.value ||
              "https://i.pravatar.cc/150?img=12",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;