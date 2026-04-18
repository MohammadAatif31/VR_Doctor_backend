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
  default: null
}

}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);