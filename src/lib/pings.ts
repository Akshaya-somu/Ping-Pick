// src/lib/pings.ts

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create a new medicine ping
 */
export const createPing = async (
  medicineName: string,
  urgency: "normal" | "emergency",
  userId: string,
  location: { lat: number; lng: number }
) => {
  console.log("📤 Creating ping:", { medicineName, urgency, userId });

  const pingData = {
    medicineName,
    urgency,
    userId,
    userLocation: location,
    radiusKm: 3, // initial radius
    status: "active", // active | expired | fulfilled
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "pings"), pingData);

  console.log("✅ Ping created with ID:", docRef.id);

  return docRef;
};
