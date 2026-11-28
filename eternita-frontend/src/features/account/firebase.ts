import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseApp } from "./firebase-app";

export { onIdTokenChanged, signOut } from "firebase/auth";

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
