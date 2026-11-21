// UCC GROOMING SERVICE - CORE TYPE DEFINITIONS

export type UserRole = 'customer' | 'vendor' | 'admin';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profileImage?: string;
  createdAt: any;
  accountStatus: AccountStatus;
}

export type VendorCategory = 
  | 'barbering' 
  | 'hair_styling' 
  | 'braiding' 
  | 'locs' 
  | 'nails' 
  | 'spa_facial' 
  | 'grooming_package';

export type CampusArea = 
  | 'Science' 
  | 'Old Site' 
  | 'New Site' 
  | 'Amamoma' 
  | 'Kwaprow' 
  | 'Apewosika' 
  | 'Ayensu' 
  | 'Valco / Casford' 
  | 'Oguaa / ATL' 
  | 'Other / Surrounding UCC';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type ShopStatus = 'open' | 'closed';
export type AvailabilityStatus = 'accepting_bookings' | 'busy' | 'walk_ins_only';

export interface Vendor {
  vendorId: string;
  ownerId: string;
  shopName: string;
  description: string;
  categories: VendorCategory[];
  phoneNumber: string;
  whatsappNumber: string;
  profileImage: string;
  gallery?: string[];
  businessAddress: string;
  region: string;
  town: string;
  area: CampusArea;
  latitude: number;
  longitude: number;
  verificationStatus: VerificationStatus;
  shopStatus: ShopStatus;
  availabilityStatus: AvailabilityStatus;
  currentQueueCount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: any;
  updatedAt: any;
}

export type PricingType = 'fixed' | 'starting_at' | 'hourly';

export interface ServiceItem {
  serviceId: string;
  vendorId: string;
  serviceName: string;
  description: string;
  price: number;
  pricingType: PricingType;
  duration: number; // in minutes
  imageUrl?: string;
  isAvailable: boolean;
  category?: VendorCategory;
  createdAt: any;
  updatedAt: any;
}

export interface BreakPeriod {
  start: string; // e.g. "13:00"
  end: string;   // e.g. "14:00"
  label: string; // e.g. "Lunch Break"
}

export interface WorkingHour {
  vendorId: string;
  day: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  dayName: string;
  openingTime: string; // "08:00"
  closingTime: string; // "20:00"
  breakPeriods: BreakPeriod[];
  isWorkingDay: boolean;
}

export interface QueueUpdate {
  vendorId: string;
  customerCount: number;
  estimatedWaitMinutesPerPerson: number;
  updatedAt: any;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type PaymentMethod = 'paystack_momo' | 'paystack_card' | 'pay_at_shop' | 'hubtel';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface Appointment {
  appointmentId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  vendorId: string;
  vendorName?: string;
  serviceId: string;
  serviceNameSnapshot: string;
  agreedPrice: number;
  serviceDuration: number; // minutes
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  bookingStatus: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNotes?: string;
  cancellationReason?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PaymentRecord {
  paymentId: string;
  appointmentId: string;
  customerId: string;
  vendorId: string;
  amount: number;
  currency: string; // "GHS"
  paymentProvider: 'paystack' | 'hubtel' | 'cash';
  transactionReference: string;
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded';
  channel?: string; // "mobile_money" | "card"
  paidAt?: any;
  createdAt: any;
}

export interface Review {
  reviewId: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  rating: number; // 1 - 5
  comment: string;
  photos?: string[];
  createdAt: any;
}

export type NotificationType = 
  | 'booking_request' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'queue_alert' 
  | 'payment_success' 
  | 'system';

export interface NotificationItem {
  notificationId: string;
  recipientId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  actionUrl?: string;
  isRead: boolean;
  createdAt: any;
}

export interface Favourite {
  favouriteId: string;
  customerId: string;
  vendorId: string;
  createdAt: any;
}

export type ReportType = 'no_show' | 'poor_hygiene' | 'payment_dispute' | 'inappropriate_conduct' | 'other';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface ReportItem {
  reportId: string;
  reporterId: string;
  reporterName?: string;
  reportedUserId: string;
  vendorId?: string;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: any;
}

export interface AdminLog {
  logId: string;
  administratorId: string;
  action: string;
  targetId: string;
  metadata?: Record<string, any>;
  timestamp: any;
}
