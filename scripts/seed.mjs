// Standalone CLI Seed script for UCC Grooming Service
// Run with: node scripts/seed.mjs

console.log("Seeding UCC Grooming Service database via local Next.js API...");

async function seed() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    console.log("Result:", data);
  } catch (err) {
    console.error("Make sure your local dev server or emulator is running on http://localhost:3000", err);
  }
}

seed();
