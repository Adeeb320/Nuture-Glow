
export type Language = 'en' | 'bn';

export type NotificationType = 'VACCINE' | 'APPOINTMENT' | 'APPOINTMENT_CANCELED' | 'COMMUNITY' | 'HOSPITAL' | 'REPORT' | 'VERIFICATION' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  entityId?: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  healthId: string;
  avatar: string;
  verified: 'Not Submitted' | 'Pending' | 'Verified' | 'Rejected';
  role?: 'USER' | 'ADMIN';
  premium?: boolean;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  attachments: {
    name: string;
    url: string; // Base64
    type: string;
  }[];
}

export interface VerificationDocument {
  id: string;
  userId: string;
  type: 'NID' | 'BIRTH_CERT' | 'MARRIAGE_CERT' | 'MEDICAL_REPORT';
  status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface MedicalReport {
  bloodGroup: string;
  allergies: string;
  diabetesStatus: boolean;
  knownConditions: string;
}

export interface DoctorVisit {
  id: string;
  userId: string;
  doctorName: string;
  clinic: string;
  date: string;
  reason: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  image: string;
  fee: number;
  availableSlots: string[];
  type: 'Online' | 'Offline' | 'Both';
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  type: 'Online' | 'Offline';
  notes?: string;
}

export interface VaccineRecord {
  id: string;
  userId: string;
  name: string;
  dueDate: string;
  status: 'Taken' | 'Pending' | 'Missed';
  notes?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[]; // array of userIds
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: PostComment[];
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  contact: string;
  type: string;
  beds: 'Available' | 'Limited' | 'Unknown';
  lat: number;
  lng: number;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface Myth {
  id: string;
  myth: string;
  fact: string;
  category: string;
}

export interface MealLog {
  id: string;
  userId: string;
  name: string;
  calories: number;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  time: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phone: string;
  verified?: boolean;
}

export interface BloodRequest {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  area: string;
  requesterPhone: string;
  message?: string;
  createdAt: string;
  status: 'sent';
}
