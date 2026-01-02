
// Seed file for initial database population
// Fixed: Using default import and destructuring to resolve PrismaClient when direct named export fails
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.doctor.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.notification.deleteMany();

  // Doctors
  await prisma.doctor.createMany({
    data: [
      { name: 'Dr. Arifa Begum', specialty: 'Gynaecologist', hospital: 'Dhaka Medical', location: 'Dhaka' },
      { name: 'Dr. Mahbub Rahman', specialty: 'Pediatrician', hospital: 'Square Hospital', location: 'Dhaka' },
    ],
  });

  // Vaccines
  await prisma.vaccine.createMany({
    data: [
      { name: 'BCG', dueDate: new Date('2024-12-01'), description: 'Tuberculosis prevention' },
      { name: 'Polio (OPV)', dueDate: new Date('2024-12-15'), description: 'Polio prevention' },
    ],
  });

  // Hospitals
  await prisma.hospital.createMany({
    data: [
      { name: 'Dhaka Medical College', location: 'Ramna, Dhaka', contact: '+8802-9669340', type: 'Public', beds: 'Limited' },
      { name: 'Square Hospital', location: 'Panthapath, Dhaka', contact: '+8802-8144400', type: 'Private', beds: 'Available' },
    ],
  });

  // Notifications for mock user 'u1'
  await prisma.notification.createMany({
    data: [
      { userId: 'u1', type: 'VACCINE', title: 'Vaccine Reminder', message: 'BCG vaccine is due in 2 days. Don\'t forget!', link: '/vaccines', isRead: false },
      { userId: 'u1', type: 'APPOINTMENT', title: 'Booking Confirmed', message: 'Your visit with Dr. Arifa is scheduled for tomorrow.', link: '/appointments', isRead: true },
      { userId: 'u1', type: 'COMMUNITY', title: 'New Reply', message: 'Someone commented on your post: "Stay strong, mama!"', link: '/community', isRead: false },
      { userId: 'u1', type: 'REPORT', title: 'New Lab Report', message: 'Your blood test results are ready to view.', link: '/profile', isRead: false },
    ]
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
