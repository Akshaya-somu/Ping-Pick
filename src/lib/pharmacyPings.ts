import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Listen to pings visible to pharmacies
 * - active: needs response
 * - reserved-pending: already responded
 */
export const listenToActivePings = (callback: (pings: any[]) => void) => {
  console.log("🏥 Setting up pharmacy pings listener...");

  const q = query(collection(db, "pings"), where("status", "in", ["active"]));

  return onSnapshot(q, (snapshot) => {
    console.log(
      "🔔 Pharmacy snapshot received! Document count:",
      snapshot.docs.length
    );

    const pings = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`📄 Active ping ${doc.id}:`, data);
      return {
        id: doc.id,
        ...data,
      };
    });

    console.log("🏥 Pharmacy pings:", pings);
    callback(pings);
  });
};
