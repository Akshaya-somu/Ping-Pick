# 📱 Ping&Pick

**Ping nearby pharmacies. Pick medicines faster.**

Ping&Pick is a **real-time, location-based medicine discovery platform** that helps users quickly find essential medicines by combining **digital search** with **live pharmacy pings**. The system enables pharmacies to manually confirm availability without requiring full inventory digitization, making it practical, inclusive, and emergency-ready.

---

## 🚀 Key Features

- 🔍 **Hybrid Medicine Discovery**

  - Search pharmacies with digital inventory
  - Broadcast medicine requests to nearby pharmacies when data is unavailable

- 📡 **Real-Time Pharmacy Ping**

  - Pharmacies receive instant notifications
  - Manual, human-verified availability confirmation

- ⏳ **Selectable Reservation Duration**

  - Pharmacies choose reservation time (10–60 mins or custom)
  - Live countdown with auto-expiry

- 🔐 **Concurrency Control**

  - Only one active reservation allowed per ping
  - Prevents inventory blocking and misuse

- 📍 **Radius Expansion (Step-Up Broadcast)**

  - Initial search radius: 3 km
  - Expands to 10 km only if no responses are received

- 👻 **No-Show Detection**

  - Tracks users who reserve but don’t arrive
  - Temporary reservation restrictions for repeated no-shows

- ⚠️ **Emergency Mode**

  - Priority highlighting for urgent medicine requests

- 🔒 **Privacy-First Design**
  - Anonymous broadcasts
  - No prescription or sensitive health data stored

---

## 🧠 Problem Statement

- Small pharmacies lack digital inventory systems
- Users waste time visiting multiple stores
- Emergency medicine needs require instant confirmation
- Fixed-radius searches fail in rural areas
- Pharmacies suffer losses due to user no-shows

---

## 💡 Solution Overview

Ping&Pick solves these challenges through a **hybrid discovery model**:

- Digital search where inventory exists
- Real-time pinging where it doesn’t
- Manual confirmation for accuracy
- Smart reservation controls for fairness and trust

---

## 👥 User Roles

### 👤 User (Patient / Customer)

- Search medicines
- Send ping requests
- Select urgency (Normal / Emergency)
- View pharmacy responses
- Reserve medicine
- Navigate to pharmacy

### 🏪 Pharmacy (Medical Store)

- Receive medicine pings
- Manually verify availability
- Select reservation duration
- Manage active reservations

### 🧑‍💼 Admin (Optional)

- Monitor activity and analytics
- Track no-show metrics
- Verify pharmacies

---

## 🔄 Application Workflow

1. **Authentication**

   - Email/password login
   - Role selection (User / Pharmacy)
   - Location permission required

2. **Medicine Search**

   - Digital inventory search
   - If unavailable → Ping nearby pharmacies

3. **Ping Broadcast**

   - Anonymous request
   - Contains medicine name, urgency, location, timestamp

4. **Radius Expansion**

   - Starts at 3 km
   - Expands to 10 km with user confirmation

5. **Pharmacy Response**

   - Available / Not Available
   - Optional price
   - Reservation duration selection

6. **Reservation**

   - One active reservation per ping
   - Auto-expiry enforced
   - Countdown visible to user

7. **Pickup Verification**

   - GPS proximity detection OR
   - QR code scan at pharmacy

8. **No-Show Handling**
   - Expired reservation without pickup → No-show
   - Repeated no-shows trigger restrictions

---

## 🧰 Tech Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Frontend (Web)  | Vite, React, TypeScript  |
| UI Components   | shadcn/ui, Tailwind CSS  |
| Authentication  | Firebase Authentication  |
| Database        | Firebase Cloud Firestore |
| Notifications   | Firebase Cloud Messaging |
| Backend Logic   | Firebase Cloud Functions |
| Maps & Location | Google Maps API          |
| Analytics       | Firebase Analytics       |
| Deployment      | Firebase Hosting         |

---

## 🗄️ Core Data Entities

- Users
- Pharmacies
- Ping Requests
- Pharmacy Responses
- Reservations
- No-Show Metrics

---

## 🔐 Ethics & Safety

- No medical diagnosis or advice
- No prescription storage
- Approximate location sharing only
- Human-verified availability

---

## 📈 Success Metrics

- Average medicine discovery time
- Emergency resolution rate
- Pharmacy response rate
- Reservation success ratio
- Reduction in no-shows over time

---

## 🏁 One-Line Summary

**Ping&Pick is a hybrid medicine discovery platform that lets users search digital pharmacy data or ping nearby pharmacies for real-time, human-verified medicine availability—ensuring faster, fair, and reliable access without forcing inventory digitization.**

---

## 📌 Project Status

🚧 **Prototype / MVP-ready**  
https://ping-pick.web.app
Designed for real-world constraints, rural inclusion, and emergency scenarios.

---

## 🤝 Contributions

Suggestions and improvements are welcome.

---
