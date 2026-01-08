import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Listen to pharmacy responses for a USER (real-time)
 * Shows pings that pharmacies responded to
 */
export const listenToUserPings = (
  userId: string,
  callback: (pings: any[]) => void
) => {
  console.log("🔍 Setting up user pings listener for userId:", userId);

  const q = query(
    collection(db, "pings"),
    where("userId", "==", userId),
    where("status", "==", "reserved-pending")
  );

  console.log("📡 Query setup complete, starting listener...");

  return onSnapshot(
    q,
    (snapshot) => {
      console.log(
        "🔔 Snapshot received! Document count:",
        snapshot.docs.length
      );

      if (snapshot.docChanges().length > 0) {
        console.log("📝 Document changes detected:");
        snapshot.docChanges().forEach((change) => {
          console.log(`  ${change.type}:`, change.doc.id, change.doc.data());
        });
      }

      const results = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`📄 Document ${doc.id}:`, data);
        console.log(`  - userId: ${data.userId}`);
        console.log(`  - status: ${data.status}`);
        console.log(`  - has pharmacyResponse: ${!!data.pharmacyResponse}`);
        return {
          id: doc.id,
          ...data,
        };
      });

      console.log("📲 USER DASHBOARD LISTENER FIRED:", results);
      console.log("📊 Number of results:", results.length);

      callback(results);
    },
    (error) => {
      console.error("❌ USER PINGS LISTENER ERROR:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
      });
    }
  );
};
