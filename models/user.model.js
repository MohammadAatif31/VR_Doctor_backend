import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  refreshToken: {
    type: String
  },

  isBanned:{
    type:Boolean,
    default:false
  },

  messageCount: {
  type: Number,
  default: 0
},

lastMessageTime:{
  type :Date,
  default:Date.now
},

isPremium: {
  type: Boolean,
  default: false
},

premiumExpiry: {
  type: Date,
  default: null
},

autoRenew: {
  type: Boolean,
  default: false
}

}, { timestamps: true });

export default mongoose.model("User", userSchema);