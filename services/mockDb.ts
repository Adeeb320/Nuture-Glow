
import { 
  Doctor, VaccineRecord, Hospital, Medicine, Myth, User, Appointment, 
  VerificationDocument, MedicalReport, DoctorVisit, JournalEntry, 
  Notification, CommunityPost, PostComment, MealLog, Donor, BloodRequest
} from '../types';

export { type MealLog };

export const SEED_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Arifa Begum', specialty: 'Gynaecologist', hospital: 'Dhaka Medical', location: 'Dhaka', fee: 1000, image: 'https://picsum.photos/seed/doc1/200', availableSlots: ['09:00 AM', '10:30 AM', '04:00 PM'], type: 'Both' },
  { id: 'd2', name: 'Dr. Mahbub Rahman', specialty: 'Pediatrician', hospital: 'Square Hospital', location: 'Dhaka', fee: 1200, image: 'https://picsum.photos/seed/doc2/200', availableSlots: ['11:00 AM', '01:00 PM', '05:30 PM'], type: 'Offline' },
  { id: 'd3', name: 'Dr. Nusrat Jahan', specialty: 'Nutritionist', hospital: 'Labaid Hospital', location: 'Dhaka', fee: 800, image: 'https://picsum.photos/seed/doc3/200', availableSlots: ['08:00 AM', '12:00 PM', '06:00 PM'], type: 'Online' },
];

export const SEED_DONORS: Donor[] = [
  { id: 'bd1', name: 'Tanvir Ahmed', bloodGroup: 'O+', location: 'Banani, Dhaka', phone: '+8801711223344', verified: true },
  { id: 'bd2', name: 'Nabila Karim', bloodGroup: 'B+', location: 'Dhanmondi, Dhaka', phone: '+8801811223344', verified: true },
  { id: 'bd3', name: 'Sajid Islam', bloodGroup: 'A-', location: 'Gulshan, Dhaka', phone: '+8801911223344', verified: false },
];

class MockDB {
  private getStore<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStore<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('db-update', { detail: { key } }));
  }

  private notify(userId: string, type: Notification['type'], title: string, message: string, link?: string, entityId?: string) {
    const notifs = this.getStore<Notification>('notifications');
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      entityId,
      title,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.setStore('notifications', notifs);
    window.dispatchEvent(new Event('new-notification'));
  }

  // Tracking
  getHydration(userId: string): number { return parseInt(localStorage.getItem(`hydration_${userId}`) || '4'); }
  updateHydration(userId: string, count: number) { 
    localStorage.setItem(`hydration_${userId}`, count.toString()); 
    window.dispatchEvent(new Event('db-update')); 
  }
  getPregnancyWeek(userId: string): number { return parseInt(localStorage.getItem(`week_${userId}`) || '24'); }
  updatePregnancyWeek(userId: string, week: number) { 
    localStorage.setItem(`week_${userId}`, week.toString()); 
    window.dispatchEvent(new Event('db-update')); 
  }

  // Generic Health Records (Weight, Heart Rate, etc)
  getHealthHistory(userId: string, key: string): {date: string, value: string}[] {
    return this.getStore(`health_history_${key}_${userId}`);
  }
  addHealthRecord(userId: string, key: string, record: {date: string, value: string}) {
    const history = this.getHealthHistory(userId, key);
    history.unshift(record);
    this.setStore(`health_history_${key}_${userId}`, history.slice(0, 10)); // Keep last 10
  }

  // Users
  getUsers(): any[] { return this.getStore('ng_mock_users'); }
  saveUser(user: any) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) users[idx] = user;
    else users.push(user);
    this.setStore('ng_mock_users', users);
  }

  // Appointments
  getAppointments(userId: string): Appointment[] { return this.getStore<Appointment>(`appointments_${userId}`); }
  addAppointment(userId: string, appointment: Omit<Appointment, 'id' | 'userId'>) {
    const apps = this.getAppointments(userId);
    const newApp = { ...appointment, id: Math.random().toString(36).substr(2, 9), userId };
    apps.unshift(newApp);
    this.setStore(`appointments_${userId}`, apps);
    this.notify(userId, 'APPOINTMENT', 'Appointment Scheduled', `Confirmed for ${appointment.date}.`, '/appointments', newApp.id);
    return newApp;
  }
  updateAppointmentStatus(userId: string, appId: string, status: Appointment['status']) {
    const apps = this.getAppointments(userId);
    const updated = apps.map(a => a.id === appId ? { ...a, status } : a);
    this.setStore(`appointments_${userId}`, updated);

    if (status === 'Cancelled') {
      const notifs = this.getStore<Notification>('notifications');
      const existingIdx = notifs.findIndex(n => n.entityId === appId && n.type === 'APPOINTMENT');
      if (existingIdx > -1) {
        notifs[existingIdx].type = 'APPOINTMENT_CANCELED';
        notifs[existingIdx].title = 'Appointment Canceled';
        notifs[existingIdx].message = `Your appointment for ${notifs[existingIdx].message.split('for ')[1] || 'the scheduled date'} has been canceled.`;
        notifs[existingIdx].isRead = false;
        notifs[existingIdx].createdAt = new Date().toISOString();
        this.setStore('notifications', notifs);
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        this.notify(userId, 'APPOINTMENT_CANCELED', 'Appointment Canceled', 'A scheduled visit has been canceled.', '/appointments', appId);
      }
    }
  }
  deleteAppointment(userId: string, appId: string) {
    const apps = this.getAppointments(userId);
    this.setStore(`appointments_${userId}`, apps.filter(a => a.id !== appId));
  }

  // Vaccines
  getVaccines(userId: string): VaccineRecord[] { return this.getStore<VaccineRecord>(`vaccines_${userId}`); }
  addVaccine(userId: string, vaccine: Omit<VaccineRecord, 'id' | 'userId'>) {
    const vaccines = this.getVaccines(userId);
    const newV = { ...vaccine, id: Math.random().toString(36).substr(2, 9), userId };
    vaccines.unshift(newV);
    this.setStore(`vaccines_${userId}`, vaccines);
  }
  updateVaccineStatus(userId: string, id: string, status: VaccineRecord['status']) {
    const vaccines = this.getVaccines(userId);
    const updated = vaccines.map(v => v.id === id ? { ...v, status } : v);
    this.setStore(`vaccines_${userId}`, updated);
  }

  // Nutrition
  getNutritionLogs(userId: string): MealLog[] { return this.getStore<MealLog>(`nutrition_${userId}`); }
  addNutritionLog(userId: string, log: Omit<MealLog, 'id' | 'userId' | 'time'>) {
    const logs = this.getNutritionLogs(userId);
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9), userId, time: new Date().toLocaleTimeString() };
    logs.unshift(newLog);
    this.setStore(`nutrition_${userId}`, logs);
  }

  // Community
  getPosts(): CommunityPost[] { return this.getStore<CommunityPost>('community_posts'); }
  addPost(userId: string, authorName: string, content: string, image?: string) {
    const posts = this.getPosts();
    const newPost: CommunityPost = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      authorName,
      content,
      image,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    posts.unshift(newPost);
    this.setStore('community_posts', posts);
    return newPost;
  }
  deletePost(postId: string) {
    const posts = this.getPosts();
    this.setStore('community_posts', posts.filter(p => p.id !== postId));
  }
  toggleLike(userId: string, postId: string) {
    const posts = this.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const liked = p.likes.includes(userId);
        return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
      }
      return p;
    });
    this.setStore('community_posts', updated);
  }
  addComment(userId: string, authorName: string, postId: string, content: string) {
    const posts = this.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const newComment: PostComment = {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          authorName,
          content,
          createdAt: new Date().toISOString(),
          replies: []
        };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    this.setStore('community_posts', updated);
  }

  deleteComment(postId: string, commentId: string) {
    const posts = this.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
      }
      return p;
    });
    this.setStore('community_posts', updated);
  }

  // Journal
  getJournalEntries(userId: string): JournalEntry[] { return this.getStore<JournalEntry>(`journal_${userId}`); }
  addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'date'>) {
    const entries = this.getJournalEntries(userId);
    const newEntry = { ...entry, id: Math.random().toString(36).substr(2, 9), userId, date: new Date().toISOString() };
    entries.unshift(newEntry);
    this.setStore(`journal_${userId}`, entries);
    return newEntry;
  }
  deleteJournalEntry(userId: string, entryId: string) {
    const entries = this.getJournalEntries(userId);
    this.setStore(`journal_${userId}`, entries.filter(e => e.id !== entryId));
  }

  // Donors
  getDonors(): Donor[] { 
    const custom = this.getStore<Donor>('custom_donors');
    return [...SEED_DONORS, ...custom];
  }
  addDonor(donor: Donor) {
    const custom = this.getStore<Donor>('custom_donors');
    custom.unshift(donor);
    this.setStore('custom_donors', custom);
  }
  
  getBloodRequests(): BloodRequest[] { return this.getStore<BloodRequest>('blood_requests'); }
  addBloodRequest(req: BloodRequest) {
    const requests = this.getBloodRequests();
    requests.unshift(req);
    this.setStore('blood_requests', requests.slice(0, 10)); // Keep last 10
  }
  deleteBloodRequest(id: string) {
    const reqs = this.getBloodRequests();
    this.setStore('blood_requests', reqs.filter(r => r.id !== id));
  }

  // Notifications
  getNotifications(): Notification[] { return this.getStore('notifications'); }
  markAsRead(id: string) {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.setStore('notifications', updated);
    window.dispatchEvent(new Event('notification-updated'));
  }
  markAllAsRead() {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => ({ ...n, isRead: true }));
    this.setStore('notifications', updated);
    window.dispatchEvent(new Event('notification-updated'));
  }
  clearNotifications() { this.setStore('notifications', []); }

  // Profile & Documents
  getVerificationDocs(userId: string): VerificationDocument[] { return this.getStore(`docs_${userId}`); }
  updateVerificationDoc(userId: string, type: VerificationDocument['type'], file: { name: string, url: string }) {
    const docs = this.getVerificationDocs(userId);
    const existingIdx = docs.findIndex(d => d.type === type);
    const newDoc: VerificationDocument = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      status: 'PENDING',
      fileName: file.name,
      fileUrl: file.url,
      uploadedAt: new Date().toISOString()
    };
    if (existingIdx > -1) docs[existingIdx] = newDoc;
    else docs.push(newDoc);
    this.setStore(`docs_${userId}`, docs);
  }

  getMedicalReport(userId: string): MedicalReport {
    const data = localStorage.getItem(`medical_${userId}`);
    return data ? JSON.parse(data) : { bloodGroup: '', allergies: '', diabetesStatus: false, knownConditions: '' };
  }
  saveMedicalReport(userId: string, report: MedicalReport) {
    localStorage.setItem(`medical_${userId}`, JSON.stringify(report));
  }

  getVisitHistory(userId: string): DoctorVisit[] { return this.getStore(`visits_${userId}`); }
  addVisitRecord(userId: string, visit: Omit<DoctorVisit, 'id' | 'userId'>) {
    const visits = this.getVisitHistory(userId);
    const newV = { ...visit, id: Math.random().toString(36).substr(2, 9), userId };
    visits.unshift(newV);
    this.setStore(`visits_${userId}`, visits);
  }
  deleteVisitRecord(userId: string, id: string) {
    const visits = this.getVisitHistory(userId);
    this.setStore(`visits_${userId}`, visits.filter(v => v.id !== id));
  }

  /**
   * Reset ONLY health-related data for a user while preserving auth and platform settings.
   */
  resetUserHealthData(userId: string) {
    const healthPrefixes = [
      `hydration_${userId}`,
      `week_${userId}`,
      `health_history_`, // covers heart rate, weight, etc.
      `appointments_${userId}`,
      `vaccines_${userId}`,
      `nutrition_${userId}`,
      `journal_${userId}`,
      `visits_${userId}`,
      `medical_${userId}`,
      `docs_${userId}`
    ];

    Object.keys(localStorage).forEach(key => {
      if (healthPrefixes.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    window.dispatchEvent(new Event('db-update'));
    window.dispatchEvent(new Event('notification-updated'));
  }
}

export const db = new MockDB();

export const SEED_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'Dhaka Medical College', location: 'Ramna, Dhaka', contact: '+88029669340', type: 'Public', beds: 'Limited', lat: 23.7258, lng: 90.3976 },
  { id: 'h2', name: 'Square Hospital', location: 'Panthapath, Dhaka', contact: '+88028144400', type: 'Private', beds: 'Available', lat: 23.7507, lng: 90.3879 },
  { id: 'h3', name: 'Evercare Hospital', location: 'Bashundhara, Dhaka', contact: '+88028401661', type: 'Private', beds: 'Available', lat: 23.8124, lng: 90.4326 },
  { id: 'h4', name: 'United Hospital', location: 'Gulshan, Dhaka', contact: '+88029853333', type: 'Private', beds: 'Limited', lat: 23.8014, lng: 90.4184 },
];

export const SEED_MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Prenatal Vitamins', price: 450, image: 'https://picsum.photos/seed/vit/200', category: 'Supplements' },
  { id: 'm2', name: 'Folic Acid', price: 120, image: 'https://picsum.photos/seed/folic/200', category: 'Supplements' },
  { id: 'm3', name: 'Baby Lotion', price: 320, image: 'https://picsum.photos/seed/lotion/200', category: 'Baby Care' },
];
