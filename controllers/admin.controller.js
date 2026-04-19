// ==============================
// ADMIN DASHBOARD CONTROLLER
// ==============================

import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import HealthLog from "../models/healthLog.model.js";
import UserProfile from "../models/userProfile.model.js";
import { decryptText } from "../utils/encryption.js"; 


// ============================== 
// GET DASHBOARD STATS
// ==============================
export const getDashboard = async (req, res) => {

  try {

    const totalUsers = await User.countDocuments();
    const totalChats = await Chat.countDocuments();
    const totalHealthLogs = await HealthLog.countDocuments();

  const totalPremiumUsers = await User.countDocuments({ isPremium: true });
const revenue = totalPremiumUsers * 29;

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    const latestChats = await Chat.find()
  .populate("userId","name email")
  .sort({ createdAt: -1 })
  .limit(5);

// 🔥 DECRYPT MESSAGES
latestChats.forEach(chat => {
  chat.messages = chat.messages.map(msg => ({
    ...msg._doc,
    text: msg.text ? decryptText(msg.text) : ""
  }));
});
    // ⭐ HEALTH LOG FIX (manual user fetch)

const logs = await HealthLog.find()
.sort({date:-1})
.limit(50);

const latestHealthLogs = await Promise.all(

logs.map(async(log)=>{

const user = await User.findById(log.userId);

return{
...log._doc,
userId:{
name:user?.name || "Unknown"
},
createdAt:log.date
};

})

);

   res.status(200).json({
  stats: {
    totalUsers,
    totalChats,
    totalHealthLogs,
    totalPremiumUsers,
    revenue
  },
  latestUsers,
  latestChats,
  latestHealthLogs
});

  } catch (error) {

    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      message: "Server Error"
    });  

  }

};



// ==============================
// DELETE USER
// ==============================
export const deleteUser = async (req,res)=>{

try{

const adminId = req.user;
const targetId = req.params.id;


// ❌ admin cannot delete himself
if(adminId === targetId){

return res.status(400).json({
message:"Admin cannot delete himself"
});

}


// find user
const user = await User.findById(targetId);

if(!user){

return res.status(404).json({
message:"User not found"
});

}


// ❌ prevent deleting another admin
if(user.role === "admin"){

return res.status(403).json({
message:"Admin account cannot be deleted"
});

}


// =========================
// DELETE USER DATA
// =========================

await User.deleteOne({_id:targetId});

await UserProfile.deleteOne({
userId:targetId
});

await Chat.deleteMany({
userId:targetId
});

await HealthLog.deleteMany({
userId:targetId
});


res.json({
message:"User and all related data deleted"
});

}catch(err){

console.log("Delete user error:",err);

res.status(500).json({
message:"Delete failed"
});

}

};



// ==============================
// GET ALL USERS
// ==============================
export const getAllUsers = async (req,res)=>{

try{

const users = await User.find().select("-password");

res.json(users);

}catch(err){

res.status(500).json({
message:"Failed to fetch users"
});

}

};



// ==============================
// GET ALL CHATS
// ==============================
export const getAllChats = async (req,res)=>{

try{

const chats = await Chat.find()
.populate("userId","name email")
.sort({createdAt:-1});

res.json(chats);

}catch(err){

res.status(500).json({
message:"Failed to fetch chats"
});

}

};



// ==============================
// GET ALL HEALTH LOGS
// ==============================
export const getAllHealthLogs = async (req,res)=>{

try{

const logs = await HealthLog.find()
.populate("userId","name email")
.sort({createdAt:-1});

res.json(logs);

}catch(err){

res.status(500).json({
message:"Failed to fetch logs"
});

}

};



// ==============================
// DELETE CHAT
// ==============================
export const deleteChat = async (req,res)=>{

try{

const chat = await Chat.findById(req.params.id);

if(!chat){

return res.status(404).json({
message:"Chat not found"
});

}

await chat.deleteOne();

res.json({
message:"Chat deleted"
});

}catch(err){

res.status(500).json({
message:"Delete chat failed"
});

}

};



// ==============================
// DELETE HEALTH LOG
// ==============================
export const deleteHealthLog = async (req,res)=>{

try{

await HealthLog.findByIdAndDelete(req.params.id);

res.json({
message:"Health log deleted"
});

}catch(err){

res.status(500).json({
message:"Delete health log failed"
});

}

};



// ==============================
// DELETE ALL HEALTH LOGS
// ==============================
export const deleteAllHealthLogs = async (req,res)=>{

try{

await HealthLog.deleteMany();

res.json({
message:"All health logs deleted"
});

}catch(err){

res.status(500).json({
message:"Delete all logs failed"
});

}

};



// ==============================
// ANALYTICS
// ==============================
export const getAnalytics = async(req,res)=>{

try{

const dailyChats = await Chat.aggregate([
{
$group:{
_id:{
$dayOfMonth:"$createdAt"
},
count:{$sum:1}
}
},
{$sort:{_id:1}}
]);

const dailyLogs = await HealthLog.aggregate([
{
$group:{
_id:{
$dayOfMonth:"$createdAt"
},
count:{$sum:1}
}
},
{$sort:{_id:1}}
]);

res.json({
dailyChats,
dailyLogs
});

}catch(err){

res.status(500).json({
message:"Analytics error"
});

}

};



// ==============================
// BAN / UNBAN USER
// ==============================
export const toggleBanUser = async(req,res)=>{

try{

const user = await User.findById(req.params.id);

if(!user){
return res.status(404).json({
message:"User not found"
});
}

user.isBanned = !user.isBanned;

await user.save();

res.json({
message:user.isBanned ? "User banned":"User unbanned"
});

}catch(err){

res.status(500).json({
message:"Ban failed"
});

}

};

// ==============================
// DELETE ALL CHATS
// ==============================
export const deleteAllChats = async (req,res)=>{

try{

await Chat.deleteMany();

res.json({
message:"All chats deleted"
});

}catch(err){

res.status(500).json({
message:"Delete all chats failed"
});

}

};

export const getPremiumUsers = async (req, res) => {
  try {
    const users = await User.find({ isPremium: true })
      .select("name email premiumExpiry");

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch premium users" });
  }
};