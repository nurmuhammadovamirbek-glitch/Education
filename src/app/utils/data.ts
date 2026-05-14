export interface Course {
  id: string;
  name: string;
  description: string;
  studentsCompleted: number;
  benefits: string[];
  monthlyPrice: number;
  instructor: {
    name: string;
    experience: string;
    achievements: string[];
    bio: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  email: string;
  passportId: string;
  password: string;
  login: string;
  enrolledCourses: EnrolledCourse[];
  notifications: Notification[];
  debt: number;
  nextPaymentDate: string;
  isAdmin?: boolean;
}

export interface EnrolledCourse {
  courseId: string;
  enrolledDate: string;
  instructorName: string;
  results: ExamResult[];
  attendance: AttendanceRecord[];
  warnings: number;
}

export interface ExamResult {
  date: string;
  score: number;
  maxScore: number;
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
  grade?: number;
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

// =============================================
// ⚠️  SHU YERNI O'ZGARTIRING:
// Render backendingiz URLini yozing
// Masalan: "https://mavlonov-backend.onrender.com"
// =============================================
const API_URL = "https://mavlonov-backend.onrender.com";

export const courses: Course[] = [
  {
    id: "1",
    name: "Boshlang'ich matematika",
    description: "1-4 sinflar uchun matematikaning asoslari. Bolalar uchun qiziqarli va tushunarli tarzda o'rgatamiz.",
    studentsCompleted: 324,
    benefits: [
      "Matematika asoslarini puxta o'rganish",
      "Mantiqiy fikrlashni rivojlantirish",
      "Amaliy masalalar yechish",
      "Interaktiv darslar"
    ],
    monthlyPrice: 300000,
    instructor: {
      name: "Nodira Mavlonova",
      experience: "8 yillik tajriba",
      achievements: [
        "Matematika fani bo'yicha O'zbekiston chempioni",
        "200+ o'quvchini muvaffaqiyatli tayyorlagan",
        "Innovatsion o'qitish metodlari sertifikati"
      ],
      bio: "Boshlang'ich sinf o'quvchilariga matematikani sevdirish - mening asosiy maqsadim."
    }
  },
  {
    id: "2",
    name: "DTM matematika",
    description: "DTM imtihoniga tayyorgarlik. To'liq qamrovli dastur, real test mashqlari va natijaga kafolat.",
    studentsCompleted: 567,
    benefits: [
      "DTM formatiga moslashgan mashqlar",
      "Haftalik sinov testlari",
      "Shaxsiy konsultatsiyalar",
      "95% o'tish ko'rsatkichi"
    ],
    monthlyPrice: 450000,
    instructor: {
      name: "Jamshid Mavlonov",
      experience: "12 yillik tajriba",
      achievements: [
        "DTM bo'yicha 500+ o'quvchini tayyorlagan",
        "O'rtacha natija 85+ ball",
        "Matematika olimpiada hakami",
        "Respublika miqyosidagi treninglar o'tkazgan"
      ],
      bio: "DTM - bu faqat bilim emas, strategiya."
    }
  },
  {
    id: "3",
    name: "Matematika sertifikati",
    description: "Xalqaro standartlarga mos matematika sertifikati olish uchun to'liq kurs.",
    studentsCompleted: 189,
    benefits: [
      "Xalqaro tan olingan sertifikat",
      "Ilg'or mavzular",
      "Amaliy loyihalar",
      "Portfolio yaratish"
    ],
    monthlyPrice: 500000,
    instructor: {
      name: "Jamshid Mavlonov",
      experience: "12 yillik tajriba",
      achievements: [
        "Xalqaro matematika konferensiyalarida ishtirokchi",
        "Cambridge sertifikatlangan",
        "150+ talaba xalqaro sertifikat olgan"
      ],
      bio: "Xalqaro darajadagi bilim - kelajakka investitsiya."
    }
  },
  {
    id: "4",
    name: "Ingliz tili",
    description: "Umumiy ingliz tili kursi. Boshlang'ich va o'rta daraja uchun.",
    studentsCompleted: 421,
    benefits: [
      "Speaking, Listening, Reading, Writing",
      "Grammatika va lug'at",
      "Real hayotiy vaziyatlar",
      "Sertifikat (kurs oxirida)"
    ],
    monthlyPrice: 350000,
    instructor: {
      name: "Dilnoza Karimova",
      experience: "10 yillik tajriba",
      achievements: [
        "CELTA sertifikatlangan o'qituvchi",
        "IELTS 8.0 ball",
        "300+ o'quvchi ingliz tilini o'rgangan",
        "Xalqaro til maktablarida tajriba"
      ],
      bio: "Ingliz tilini o'rganish sayohat."
    }
  },
  {
    id: "5",
    name: "IELTS guruhi",
    description: "IELTS imtihoniga professional tayyorgarlik. Band 7.0+ ga kafolat.",
    studentsCompleted: 298,
    benefits: [
      "To'liq IELTS formatida tayyorgarlik",
      "Mock testlar",
      "Writing va Speaking individual darslar",
      "7.0+ natijaga yo'naltirilgan"
    ],
    monthlyPrice: 550000,
    instructor: {
      name: "Dilnoza Karimova",
      experience: "10 yillik tajriba",
      achievements: [
        "IELTS rasmiy examiner tajribasi",
        "O'rtacha natija 7.5 ball",
        "200+ talaba xorijga ketgan",
        "British Council bilan hamkorlik"
      ],
      bio: "IELTS - bu eshik xorijiy ta'lim va karyeraga."
    }
  }
];

// Kurslar hali ham local — ular o'zgarmaydi, DB kerak emas
export function getCourses(): Course[] {
  return courses;
}

// initializeData — endi hech narsa qilmaydi (admin backendda yaratiladi)
export function initializeData() {
  // Admin foydalanuvchi backend startup da avtomatik yaratiladi
  // localStorage ishlatilmaydi
}

// =============================================
// API FUNKSIYALARI — barcha ma'lumot Render PostgreSQL da
// =============================================

// Barcha foydalanuvchilarni serverdan olish
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Server xatosi');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Foydalanuvchilarni olishda xato:", error);
    return [];
  }
}

// Yangi foydalanuvchini serverga saqlash
export async function saveUsers(user: Omit<User, 'id'>): Promise<{ status: string; message?: string; id?: string }> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return await response.json();
  } catch (error) {
    console.error("Saqlashda xato:", error);
    return { status: 'error', message: 'Server bilan ulanishda xato' };
  }
}
