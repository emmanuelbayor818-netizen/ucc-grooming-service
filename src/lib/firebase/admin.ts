import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage, Storage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

function getFirebaseAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "ucc-grooming-services-646d5";

  // 1. Check if a local service-account.json file exists in root
  const localServiceAccountPath = path.resolve(process.cwd(), "service-account.json");
  if (fs.existsSync(localServiceAccountPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(localServiceAccountPath, "utf-8"));
      return initializeApp({
        credential: cert(fileData),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
    } catch (e) {
      console.warn("Could not parse service-account.json file:", e);
    }
  }

  // 2. Check if credentials are provided via environment variables
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
  }

  // 3. Fallback for Google Cloud default application credentials
  return initializeApp({
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  });
}

export const adminApp: App = getFirebaseAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export const adminStorage: Storage = getStorage(adminApp);

/**
 * Assign Custom Claims for Role-Based Access Control
 * Guarantees roles cannot be escalated from the client side.
 */
export async function setUserRoleClaim(uid: string, role: "customer" | "vendor" | "admin") {
  try {
    const claims: Record<string, any> = {
      role,
      admin: role === "admin",
      vendor: role === "vendor",
      customer: role === "customer",
    };
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (err) {
    console.warn("Could not set custom user claim:", err);
  }
}
