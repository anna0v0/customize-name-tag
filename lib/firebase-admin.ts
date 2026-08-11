import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "node:fs";
import path from "node:path";

type ServiceAccountFile = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function credentials(): ServiceAccountFile {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }

  const file = path.join(process.cwd(), ".firebase-service-account.json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")) as ServiceAccountFile;
  throw new Error("Firebase Admin credentials are missing.");
}

export function firebaseAdminIsConfigured() {
  if (process.env.VITEST) return false;
  return Boolean(
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      fs.existsSync(path.join(process.cwd(), ".firebase-service-account.json")),
  );
}

export function getFirebaseAdmin() {
  const app = getApps()[0] ?? (() => {
    const value = credentials();
    return initializeApp({
      credential: cert({ projectId: value.project_id, clientEmail: value.client_email, privateKey: value.private_key }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  })();
  return { auth: getAuth(app), db: getFirestore(app), bucket: getStorage(app).bucket() };
}
