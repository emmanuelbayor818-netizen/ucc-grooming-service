import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

console.log("Testing Firebase Admin SDK connection to ucc-grooming-services-646d5...");

try {
  const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf-8"));

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore(app);

  console.log("Checking Firestore collections...");
  const collections = await db.listCollections();
  console.log(`Firestore connection SUCCESSFUL! Found ${collections.length} collections.`);
  process.exit(0);
} catch (error) {
  console.error("Firestore connection error:", error);
  process.exit(1);
}
