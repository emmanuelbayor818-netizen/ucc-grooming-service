import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Storage } from "firebase-admin/storage";
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
    privateKey = privateKey.trim();
    // Strip wrapping quotes if user pasted with quotes
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
    } catch (certError) {
      console.error("Firebase Admin cert error:", certError);
    }
  }

  // 3. Fallback for Google Cloud default application credentials
  return initializeApp({
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  });
}

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;
let _adminStorage: Storage | null = null;

export function getAdminApp(): App {
  if (!_adminApp) {
    _adminApp = getFirebaseAdminApp();
  }
  return _adminApp;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

export async function getAdminAuth(): Promise<Auth> {
  if (!_adminAuth) {
    const { getAuth } = await import("firebase-admin/auth");
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

export async function getAdminStorage(): Promise<Storage> {
  if (!_adminStorage) {
    const { getStorage } = await import("firebase-admin/storage");
    _adminStorage = getStorage(getAdminApp());
  }
  return _adminStorage;
}

// Lazy proxies: zero initialization at build/import time.
// Only initializes upon first actual method invocation at runtime.
export const adminApp: App = new Proxy({} as App, {
  get(_target, prop) {
    const inst = getAdminApp();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const inst = getAdminDb();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export const adminAuth = {
  setCustomUserClaims: async (uid: string, claims: Record<string, any>) => {
    const auth = await getAdminAuth();
    return auth.setCustomUserClaims(uid, claims);
  },
  getUser: async (uid: string) => {
    const auth = await getAdminAuth();
    return auth.getUser(uid);
  },
  verifyIdToken: async (token: string, checkRevoked?: boolean) => {
    const auth = await getAdminAuth();
    return auth.verifyIdToken(token, checkRevoked);
  },
};

export const adminStorage = {
  bucket: async (name?: string) => {
    const storage = await getAdminStorage();
    return storage.bucket(name);
  },
};

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
