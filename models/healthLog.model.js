import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema({

  userId: String,

  symptoms: String,

  severity: String,

  disease: String,

  confidence: Number,
 
  advice: String,

  doctor: String,

  response: Object,

  date:{
    type: Date,
    default: Date.now
  }

});

// ⭐ YE ADD KARNA ZARURI HAI
export default mongoose.model("HealthLog", healthLogSchema);