import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const registerUser = async (
  email: string,
  password: string,
  role: "user" | "pharmacy",
  extraData: any
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role,
    ...extraData,
    createdAt: new Date(),
    noShowCount: 0,
  });

  return cred.user;
};

export const loginUser = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const fetchUserRole = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.role;
};
