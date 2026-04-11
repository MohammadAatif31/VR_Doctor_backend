import UserProfile from "../models/userProfile.model.js";
import User from "../models/user.model.js";


// ✅ SAVE / UPDATE PROFILE
export const saveProfile = async (req, res) => {
  try {
    const userId = req.user;

    let { name, age, gender, weight, bloodGroup, allergies, diseases } =
      req.body;

    // ⭐ image from cloudinary
    const photo = req.file?.path;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        name,
        age,
        gender,
        weight,
        bloodGroup,
        allergies,
        diseases,
        ...(photo && { photo }), // only update if uploaded
      },
      { new: true, upsert: true }
    );

    // ⭐ update main user table also (sidebar sync)
await User.findByIdAndUpdate(userId, {
  ...(name && { name }),
  ...(photo && { photo })
});

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user; // ✅ direct id

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};