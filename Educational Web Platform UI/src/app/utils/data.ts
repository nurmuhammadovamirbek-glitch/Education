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
      bio: "Boshlang'ich sinf o'quvchilariga matematikani sevdirish - mening asosiy maqsadim. Har bir bola o'z sur'atida o'rganadi va men bunga yordam beraman."
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
      bio: "DTM - bu faqat bilim emas, strategiya. Men o'quvchilarimga eng samarali yechish usullarini o'rgataman va ularning ishonchini oshiraman."
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
      bio: "Xalqaro darajadagi bilim - kelajakka investitsiya. Mening kursim sizga dunyo miqyosida tan olingan malaka beradi."
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
      bio: "Ingliz tilini o'rganish sayohat. Men sizga bu sayohatda hamroh bo'laman va til to'sig'ini buzishingizga yordam beraman."
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
      bio: "IELTS - bu eshik xorijiy ta'lim va karyeraga. Men sizga bu eshikni ochishda professional yordam beraman."
    }
  }
];

// Initialize localStorage with default data
export function initializeData() {
  if (!localStorage.getItem('courses')) {
    localStorage.setItem('courses', JSON.stringify(courses));
  }

  if (!localStorage.getItem('users')) {
    const adminUser: User = {
      id: 'admin',
      firstName: 'Admin',
      lastName: 'Mentor',
      age: 30,
      phone: '+998901234567',
      email: 'admin@mavlonov.uz',
      passportId: 'ADMIN001',
      password: 'matematika',
      login: 'mentor',
      enrolledCourses: [],
      notifications: [],
      debt: 0,
      nextPaymentDate: '',
      isAdmin: true
    };
    localStorage.setItem('users', JSON.stringify([adminUser]));
  }
}

export function getUsers(): User[] {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('users', JSON.stringify(users));
}

export function getCourses(): Course[] {
  const coursesData = localStorage.getItem('courses');
  return coursesData ? JSON.parse(coursesData) : courses;
}
