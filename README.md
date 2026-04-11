# 🩺 VR Doctor – AI Health Assistant Backend (Advanced)

An advanced AI-powered virtual doctor backend system that intelligently detects symptoms, suggests possible conditions, and provides structured health guidance.

This system includes **AI processing, encrypted chat, subscription system, and admin analytics**, making it production-ready.

---

## 🚀 Core Features

---

### 🧠 AI Health Assistant
- Understands natural language symptoms
- Detects:
  - Disease (suggestion only)
  - Severity (Low / Medium / High)
  - Possible causes
- Provides:
  - Home remedies
  - Safe medicines
  - Doctor recommendation
- Uses **Gemini AI fallback** for unknown or complex cases

---

### ⚡ Advanced Symptom Engine

Multi-layer intelligent processing:

1. Smart text normalization
2. Custom spelling correction engine
3. Pattern-based symptom mapping
4. Fuzzy search (Fuse.js)
5. Ultimate symptom dictionary
6. AI fallback (Gemini)

---

### 💬 Chat System (Encrypted 🔐)

- Create and manage chat sessions
- Store:
  - User messages
  - Bot responses
- Rename / delete chats
- Restore chats after refresh

🔐 **End-to-End Encryption**
- All messages stored encrypted in DB
- Decrypted only when sending to frontend
- Protects user privacy

---

### 💳 Premium Subscription System (Razorpay)

#### 🆓 Free Users:
- 5 messages per 12 hours

#### 👑 Premium Users:
- Unlimited messages
- Faster AI experience

#### ⚙️ Features:
- Razorpay payment integration
- Payment verification (signature-based)
- Premium activation after payment
- Monthly subscription system

---

### ⏳ Smart Usage Control

- Message limit tracking (`messageCount`)
- Auto reset after **12 hours**
- Prevents API abuse

---

### 📅 Subscription Expiry System

- Each user has:
  - `isPremium`
  - `premiumExpiry`
  - `autoRenew`

✔ Auto expiry check on every request  
✔ Expired users downgraded automatically  

---

### 🔄 Auto Renewal System

- Background cron job checks:
  - Expired subscriptions
  - Auto renew users

---

### 📊 Health Logs System

Every interaction stored as structured data:

- Symptoms
- Disease
- Severity
- Confidence
- Advice
- Doctor

Used for:
- Analytics
- Dashboard
- Insights

---

### 👤 User System

- Register / Login / Logout
- JWT Authentication
- Refresh Token system
- Password change
- Ban / Unban users
- Role-based access (admin / user)

---

### 🧾 Profile System

User can store:

- Name, age, gender
- Weight, blood group
- Allergies, diseases
- Profile photo (Cloudinary)

---

### 🛡️ Admin Dashboard

#### 📊 Stats:
- Total users
- Total chats
- Health logs
- Premium users
- Revenue

#### ⚙️ Controls:
- Delete users
- Ban users
- View chats
- Delete chats
- View health logs
- Delete all logs

---

### 💰 Revenue Tracking

- Calculates:
  - Total premium users
  - Total revenue

---

### ⚡ Performance Optimization

- Response caching system
- Reduces repeated AI calls
- Improves speed

---

## 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Google Gemini AI
- Razorpay
- Fuse.js
- Cloudinary
- Multer

📂 Final Project Structure (Updated)
backend/
│
├── config/
│   ├── db.js
│   └── cloudinary.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── admin.controller.js
│   ├── chat.controller.js
│   ├── chatbot.message.js      # 🔥 CORE AI LOGIC
│   ├── health.controller.js
│   ├── profile.controller.js
│   └── payment.controller.js   # 💳 Razorpay Integration
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── upload.js
│
├── models/
│   ├── user.model.js           # ⭐ Premium fields added
│   ├── chat.model.js
│   ├── healthLog.model.js
│   └── userProfile.model.js
│
├── routes/
│   ├── auth.route.js
│   ├── chatbot.route.js
│   ├── admin.route.js
│   ├── health.route.js
│   ├── profile.route.js
│   └── payment.route.js        # 💳 Payment routes
│
├── utils/
│   ├── matchSymptom.js
│   ├── fuzzyMatch.js
│   ├── smartSymptomEngine.js
│   ├── ultimateSymptomEngine.js
│   ├── detectSymptoms.js
│   ├── detectSymptomIntent.js
│   ├── extractAIFields.js
│   ├── formatResponse.js
│   ├── generateToken.js
│   ├── debugLogger.js
│   ├── encryption.js           # 🔐 Message Encryption
│   └── cron.js                 # ⏳ Subscription Auto-Renew / Expiry
│
├── data/
│   ├── healthData.json
│   └── botGreeting.js
│
├── cache/
│   └── responseCache.js
│
├── .env
├── index.js
└── package.json

## 🔄 Complete Working Flow

---

### 🧩 1. Request Flow

User → `/message` API → chatbot.message.js

---

### 🔐 2. Security & Limits

1. JWT Authentication
2. Premium expiry check
3. 12-hour reset check
4. Free limit check (5 messages)

---

### 🧠 3. Processing Pipeline

1. Normalize text  
2. Spell correction  
3. Intent detection  

---

### 🔍 4. Matching System

Priority:

1. JSON Match  
2. Fuzzy Match  
3. Ultimate Engine  
4. Gemini AI  

---

### 🤖 5. AI Processing

- Unknown symptoms → Gemini
- Structured response generated

---

### 🔐 6. Encryption Flow

- User message → encrypted before DB save  
- Bot message → encrypted before DB save  
- While fetching → decrypted  

---

### 💾 7. Database Storage

#### Chat:
- encrypted messages

#### HealthLog:
- structured medical data

---

### 💳 8. Payment Flow

1. Frontend → create order
2. Razorpay popup opens
3. Payment success
4. Backend verifies signature
5. User upgraded to premium

---

### 📊 9. Admin Dashboard Flow

- Aggregates:
  - Users
  - Chats
  - Logs
  - Revenue

---

## 🔐 Security

- JWT authentication
- Cookie-based auth
- Message encryption
- Admin role protection
- Payment signature verification

---

## ⚡ API Endpoints

### 🔑 Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/refresh`

---

### 💬 Chat
- POST `/message`
- GET `/chat/user`
- GET `/chat/:id`
- DELETE `/chat/:id`
- DELETE `/chat/all`

---

### 💳 Payment
- POST `/payment/order`
- POST `/payment/verify`

---

### 👤 Profile
- GET `/profile/user`
- POST `/profile/save`

---

### 📊 Health
- GET `/health/history`

---

### 🛠️ Admin
- GET `/admin/dashboard`
- GET `/admin/users`
- DELETE `/admin/user/:id`
- PATCH `/admin/user/ban/:id`

---

## ⚙️ Environment Variables

```env
PORT=4002
MONGO_URI=

JWT_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_API_KEY=

RAZORPAY_KEY=
RAZORPAY_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
▶️ Run Project
Bash
Copy code
npm install
npm run dev
💡 Key Highlights
✔ AI + Rule-based hybrid system
✔ Encrypted chat system
✔ Subscription + payment system
✔ Admin analytics
✔ Production-ready backend
🔮 Future Improvements
WebSocket real-time chat
Voice-based diagnosis
Doctor booking system
Mobile app


👨‍💻 Author
Mohammad Aatif
Full Stack Developer 🚀