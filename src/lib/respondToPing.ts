import {
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/firebase";

export const respondToPing = async (
  pingId: string,
  pharmacyData: {
    pharmacyId: string;
    pharmacyName: string;
    distance: string;
    price: string;
    reservationMinutes: number;
    address?: string;
    phone?: string;
  },
  userId: string,
  medicineName: string
) => {
  const pingRef = doc(db, "pings", pingId);

  console.log("🏥 PHARMACY RESPONDING TO PING:", pingId);
  console.log("📦 Pharmacy Data:", pharmacyData);
  console.log("👤 User ID:", userId);
  console.log("💊 Medicine Name:", medicineName);

  try {
    await updateDoc(pingRef, {
      status: "reserved-pending",
      pharmacyResponse: {
        ...pharmacyData,
        respondedAt: serverTimestamp(),
      },
    });

    console.log("✅ PING UPDATED SUCCESSFULLY:", pingId);
    console.log("📝 Updated status to: reserved-pending");
    console.log("📋 pharmacyResponse set with:", {
      ...pharmacyData,
      respondedAt: "serverTimestamp()",
    });

    // Create alert for user
    await addDoc(collection(db, "alerts"), {
      userId: userId,
      type: "response",
      title: "Pharmacy Response",
      message: `${pharmacyData.pharmacyName} has ${medicineName} available at ${pharmacyData.price}`,
      timestamp: serverTimestamp(),
      read: false,
      pingId: pingId,
    });

    console.log("🔔 Alert created for user:", userId);
  } catch (error) {
    console.error("❌ Error in respondToPing:", error);
    throw error;
  }
};
