import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
 userId: {
  type: String,
  required: true,
  unique: true
 },

 name: String,
 age: Number,
 gender: String,
 weight: Number, 
 bloodGroup: String,
 allergies: String,
 diseases: String,
 photo: {
  type: String,
  default: "https://i.pravatar.cc/150?img=12"
}

}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);