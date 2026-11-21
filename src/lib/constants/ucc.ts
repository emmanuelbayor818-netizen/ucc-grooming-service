// UCC Campus Geolocation, Landmarks, and Constants
import { CampusArea, VendorCategory } from "@/types";

export interface CampusLocation {
  name: string;
  area: CampusArea;
  lat: number;
  lng: number;
  description: string;
}

// UCC Central Coordinates (Cape Coast, Ghana)
export const UCC_COORDINATES = {
  lat: 5.1155,
  lng: -1.2891,
};

export const CAMPUS_HOTSPOTS: CampusLocation[] = [
  {
    name: "Science Market / Old Site",
    area: "Science",
    lat: 5.1172,
    lng: -1.2875,
    description: "Main science complex, close to lecture theatres and science cafeteria."
  },
  {
    name: "Casely Hayford Hall (Casford)",
    area: "Valco / Casford",
    lat: 5.1215,
    lng: -1.2858,
    description: "Casford Hall commercial & grooming wing."
  },
  {
    name: "Valco Hall Shopping Hub",
    area: "Valco / Casford",
    lat: 5.1202,
    lng: -1.2845,
    description: "Near Valco Hall, popular grooming and retail spot."
  },
  {
    name: "Atlantic Hall (ATL) Annex",
    area: "Oguaa / ATL",
    lat: 5.1098,
    lng: -1.2895,
    description: "ATL shopping arcade and beachfront commercial walk."
  },
  {
    name: "Oguaa Hall Commercial Walk",
    area: "Oguaa / ATL",
    lat: 5.1112,
    lng: -1.2882,
    description: "Oguaa Hall quadrangle salon services."
  },
  {
    name: "Amamoma High Street",
    area: "Amamoma",
    lat: 5.1265,
    lng: -1.2910,
    description: "High density off-campus student hub with vibrant salons & barbershops."
  },
  {
    name: "Kwaprow Junction",
    area: "Kwaprow",
    lat: 5.1298,
    lng: -1.2835,
    description: "North gate corridor, multiple student hair studios."
  },
  {
    name: "Ayensu / Apewosika Gate",
    area: "Ayensu",
    lat: 5.1145,
    lng: -1.2980,
    description: "Hostel belt near Medical School and New Site."
  }
];

export const VENDOR_CATEGORIES: { id: VendorCategory; label: string; icon: string; description: string }[] = [
  { id: 'barbering', label: 'Barbering & Fades', icon: 'Scissors', description: 'Precision cuts, tapers, beard grooming and hot towel care' },
  { id: 'hair_styling', label: 'Hair Styling & Perm', icon: 'Sparkles', description: 'Wig styling, washing, blow drying and silk presses' },
  { id: 'braiding', label: 'Braids & Twists', icon: 'Layers', description: 'Knotless braids, box braids, cornrows and passion twists' },
  { id: 'locs', label: 'Locs & Retwists', icon: 'Flame', description: 'Starter locs, dread retwists, styling and detox' },
  { id: 'nails', label: 'Nails & Pedicure', icon: 'Hand', description: 'Gel, acrylic extensions, manicures and spa pedicures' },
  { id: 'spa_facial', label: 'Facial & Skin Care', icon: 'Smile', description: 'Exfoliation, deep pore cleansing and massage therapies' },
  { id: 'grooming_package', label: 'Student Combos', icon: 'Tag', description: 'Affordable bundles for exams, matriculation and hall weeks' },
];

export const UCC_CAMPUS_AREAS: CampusArea[] = [
  'Science',
  'Old Site',
  'New Site',
  'Amamoma',
  'Kwaprow',
  'Apewosika',
  'Ayensu',
  'Valco / Casford',
  'Oguaa / ATL',
  'Other / Surrounding UCC'
];

// Distance calculation using Haversine formula (in km)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
