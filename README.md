# UCC Grooming Service — Campus Appointment & Live Queue Platform

A web platform engineered specifically for the **University of Cape Coast (UCC)** community, connecting students and campus residents with verified campus barbershops, salons, braiders, loc stylists, and nail spas across Science, Casford, Valco, ATL, and Amamoma.

Built **100% on the Google Firebase Technology Stack** with Next.js, React, and Tailwind CSS (Zero Supabase, Zero Vercel).

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Customer (UCC Students)**: Discover salons by campus zone, browse live walk-in queue counters, book guaranteed appointment slots, pay via Mobile Money (Paystack) or at shop, and leave verified reviews.
   - **Vendor (Campus Barbers & Beauticians)**: Real-time walk-in queue counter (`+` / `-`), booking pipeline management (Confirm, In Chair, Complete & Paid), service catalog pricing & duration controls.
   - **Administrator (UCC Platform Governance)**: Verify and approve vendor applications, monitor dispute logs, and review audit trails (`adminLogs`).

2. **Anti-Double-Booking Engine**:
   - Concurrency-controlled slot reservations using **Firestore Atomic Transactions** (`adminDb.runTransaction`).
   - Automatically prevents overlapping bookings for the same barber/stylist.

3. **Live Campus Wait-Time Radar**:
   - Real-time walk-in queue tracker for Casford, Science, Valco, and Amamoma shops.
   - Calculates estimated wait times (e.g., `3 students waiting • ~75 mins est. wait`) before students leave their halls.

4. **Ghana Mobile Money & Online Payments**:
   - Paystack integration for MTN Mobile Money, Telecel Cash, and Bank Cards.
   - Support for "Pay at Physical Shop" (cash or direct MoMo upon arrival).
   - Independent tracking of `bookingStatus` and `paymentStatus`.

5. **UCC Campus Geolocation & Landmarks**:
   - Native integration with browser Geolocation API.
   - Presets for Science Market, Casely Hayford Hall (Casford), Valco Hall, Atlantic Hall (ATL), Oguaa Hall, Amamoma High Street, Kwaprow, and Ayensu.

---

## 🛠 Technology Stack

- **Frontend**: Next.js (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (Elegant Neutral palette: warm stone, sand, deep charcoal, amber gold)
- **Database**: Cloud Firestore (12 core collections with indexing and rule guards)
- **Authentication**: Firebase Authentication (Email/Password, Email Verification, Password Reset, Custom Claims)
- **File Storage**: Firebase Storage (Secure bucket rules, size and MIME type validation)
- **Backend Operations**: Cloud Functions for Firebase / Next.js Server Handlers with Firebase Admin SDK
- **Hosting & Deployment**: Firebase App Hosting (`apphosting.yaml`) or Firebase Hosting (`firebase.json`)
- **Payments**: Paystack Ghana (Mobile Money & Card)

---

## 📂 Project Structure

```
├── apphosting.yaml                # Firebase App Hosting configuration
├── firebase.json                  # Firebase Emulators & Hosting configuration
├── firestore.rules                # Production Firestore Security Rules
├── firestore.indexes.json         # Composite database indexes
├── storage.rules                  # Firebase Storage upload security rules
├── .env.example                   # Environment configuration template
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage: Hero, live queue radar, vendor directory
│   │   ├── vendor/[id]/page.tsx   # Vendor shop details & interactive booking modal
│   │   ├── customer/
│   │   │   ├── dashboard/page.tsx # Student dashboard: appointments & verified reviews
│   │   │   └── payment-demo/      # Paystack Ghana MoMo sandbox simulator
│   │   ├── vendor/dashboard/      # Vendor command hub: live queue & booking pipeline
│   │   ├── admin/dashboard/       # Admin console: vendor approvals & audit logs
│   │   ├── auth/                  # Login, Register (Student vs Vendor), Password Reset
│   │   └── api/                   # Concurrency booking, payments, slots, queue updates
│   ├── context/
│   │   └── AuthContext.tsx        # Firebase Auth state, Firestore listener, custom claims
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts          # Client Firebase initialization + emulator toggle
│   │   │   └── admin.ts           # Server Firebase Admin SDK & custom claims engine
│   │   ├── constants/ucc.ts       # UCC campus hotspots, coordinates & categories
│   │   └── utils/time.ts          # Slot calculation, overlap detection & GHS formatter
│   └── types/index.ts             # TypeScript definitions for all 12 collections
```

---

## ⚡ Step-by-Step Setup & Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```

Fill in your Firebase project credentials in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_ADMIN_PRIVATE_KEY` (Server operations)
- `PAYSTACK_SECRET_KEY` (Payments)

### Step 3: Run with Firebase Local Emulators (Recommended for Development)
To run fully offline with simulated Auth, Firestore, and Storage:
```bash
# In .env.local set:
NEXT_PUBLIC_USE_FIREBASE_EMULATORS="true"

# Start the Firebase Emulator Suite:
npm run emulators
```
- Emulator UI: `http://localhost:4000`
- Firestore Emulator: `localhost:8080`
- Auth Emulator: `localhost:9099`

### Step 4: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Seed Campus Demo Data
When the app opens, click **"Seed / Reset Campus Demo Data"** on the [Admin Console](http://localhost:3000/admin/dashboard) or run:
```bash
npm run seed
```
This automatically populates verified campus vendors across Casford, Science Market, Amamoma, and ATL with real haircuts, prices, working hours, and initial queue counts!

---

## 🔒 Firestore Security Rules Overview

- **Users (`/users/{uid}`)**: Users can only update their personal profile; roles cannot be self-escalated.
- **Vendors (`/vendors/{vendorId}`)**: Publicly readable when verified; only editable by the shop owner or admin.
- **Appointments (`/appointments/{appointmentId}`)**: Strictly accessible only by the booking student, the vendor, or platform admin.
- **Reviews (`/reviews/{reviewId}`)**: Verified booking check — reviews can only be submitted after an appointment is marked `completed`.
- **Payments (`/payments/{paymentId}`)**: Private to the customer and vendor; writes are restricted to secure server endpoints.

---

## 🚀 Firebase App Hosting & Deployment

The repository includes `apphosting.yaml` configured for Firebase App Hosting:
1. Initialize Firebase App Hosting in your Firebase Console.
2. Link your GitHub repository.
3. Add production secrets in Google Cloud Secret Manager (`paystack-secret-key`, `firebase-admin-private-key`).
4. Deploy with automatic CI/CD on every push.
