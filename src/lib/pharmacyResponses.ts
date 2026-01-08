import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

/**
 * Pharmacy responds to a ping
 */
export const respondToPing = async ({
  pingId,
  pharmacyId,
  pharmacyName,
  available,
  reservationMinutes,
}: {
  pingId: string;
  pharmacyId: string;
  pharmacyName: string;
  available: boolean;
  reservationMinutes?: number;
}) => {
  // 1️⃣ Save response
  const responseRef = doc(db, "pings", pingId, "responses", pharmacyId);

  await setDoc(responseRef, {
    pharmacyId,
    pharmacyName,
    available,
    reservationMinutes: available ? reservationMinutes : null,
    respondedAt: serverTimestamp(),
  });

  // 2️⃣ If available → mark ping as "reserved-pending"
  if (available) {
    const pingRef = doc(db, "pings", pingId);
    await updateDoc(pingRef, {
      status: "reserved-pending",
    });
  }
};
