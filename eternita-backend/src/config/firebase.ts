import {
  initializeApp,
  cert,
  type App,
} from "firebase-admin/app";

import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

import * as path from "path";
import * as fs from "fs";
import "dotenv/config";

let app: App | undefined;
let db: Firestore | undefined;

export function initializeFirebase(): Firestore {
  if (db) {
    return db;
  }

  const keyPath = path.resolve(
    process.cwd(),
    process.env.FIREBASE_KEY_PATH ?? "firebase/serviceAccountKey.json"
  );

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Firebase service-account key not found: ${keyPath}`);
  }

  app = initializeApp({
    credential: cert(keyPath),
  });

  db = getFirestore(app);

  return db;
}

export function getDb(): Firestore {
  if (!db) {
    return initializeFirebase();
  }

  return db;
}