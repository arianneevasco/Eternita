import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirebaseApp } from "./firebase-app";

export { onIdTokenChanged, signOut } from "firebase/auth";

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}
