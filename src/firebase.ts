import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCdYan6v9xjdNx98uTiUs1BB1jI3kwg90A",
  authDomain: "ping-pick.firebaseapp.com",
  projectId: "ping-pick",
  storageBucket: "ping-pick.appspot.com",
  messagingSenderId: "725706112404",
  appId: "1:725706112404:web:1353e477487a9403082381",
  measurementId: "G-RXK2SCD3JN",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
