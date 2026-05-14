import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Users, DollarSign, CheckCircle, Award, X, Loader2 } from 'lucide-react';
import { getCourses, getUsers, saveUsers, type User } from '../utils/data';

export function Courses() {
  const navigate = useNavigate();
  const courses = getCourses();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    passportId: '',
    login: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnroll = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowRegistrationModal(true);
    setError('');
    setSuccess(false);
  };

  // ✅ async qilindi — server bilan gaplashish uchun
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- Validatsiya (o'zgarmadi) ---
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.phone ||
        !formData.email || !formData.passportId || !formData.login || !formData.password || !formData.confirmPassword) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos emas');
      return;
    }
    if (formData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.login)) {
      setError("Login faqat harflar, raqamlar va pastki chiziqdan iborat bo'lishi kerak");
      return;
    }
    if (!agreeToTerms) {
      setError('Shartlarga rozilik bildiring');
      return;
    }

    setLoading(true);
    try {
      // ✅ await — serverdan mavjud foydalanuvchilarni olish
      const users = await getUsers();

      // Duplicate tekshirish
      if (users.some(u => u.passportId === formData.passportId)) {
        setError("Bu passport ID allaqachon ro'yxatdan o'tgan");
        return;
      }
      if (users.some(u => u.email === formData.email)) {
        setError("Bu email allaqachon ro'yxatdan o'tgan");
        return;
      }
      if (users.some(u => u.login === formData.login)) {
        setError('Bu login allaqachon mavjud');
        return;
      }

      // Yangi foydalanuvchi obyekti
      const newUser: Omit<User, 'id'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        phone: formData.phone,
        email: formData.email,
        passportId: formData.passportId,
        password: formData.password,
        login: formData.login,
        enrolledCourses: selectedCourse ? [{
          courseId: selectedCourse,
          enrolledDate: new Date().toISOString().split('T')[0],
          instructorName: courses.find(c => c.id === selectedCourse)?.instructor.name || '',
          results: [],
          attendance: [],
          warnings: 0
        }] : [],
        notifications: [{
          id: Date.now().toString(),
          message: `Mavlonov Akademiyasiga xush kelibsiz! Sizning login: ${formData.login}`,
          date: new Date().toISOString(),
          read: false
        }],
        debt: 0,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // ✅ await — serverga saqlash
      const result = await saveUsers(newUser as User);

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowRegistrationModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || "Xato yuz berdi. Qayta urinib ko'ring.");
      }
    } catch {
      setError("Server bilan ulanishda xato. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mavlonov Akademiyasi</h1>
              <p className="text-sm text-gray-600">Kurslar</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Tizimga kirish
          </button>
        </div>
      </header>

      {/* Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bizning kurslar</h2>
          <p className="text-xl text-gray-600">O'zingizga mos kursni tanlang va bugun o'qishni boshlang</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{course.name}</h3>
                <p className="text-blue-100">{course.description}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{course.studentsCompleted} o'quvchi bitirgan</span>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Foydalari:</h4>
                  <ul className="space-y-2">
                    {course.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                      <p className="text-sm text-gray-500">{course.instructor.experience}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{course.instructor.bio}"</p>
                </div>

                <div className="flex items-center justify-between border-t pt-6">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-gray-900">
                      {course.monthlyPrice.toLocaleString()} so'm
                    </span>
                    <span className="text-gray-500 text-sm">/oy</span>
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md hover:scale-105 transition-all font-medium"
                  >
                    Yozilish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Savollaringiz bormi?</h2>
          <p className="text-blue-100 text-lg mb-10">Biz bilan bog'laning — yordam berishga doimo tayyormiz</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="font-semibold mb-2">Telefon</h3>
              <p className="text-gray-300">+998 90 123 45 67</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="font-semibold mb-2">Call center</h3>
              <p className="text-gray-300">+998 91 234 56 78</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Telegram</h3>
              <p className="text-gray-300">@mavlonov_academy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📷</span>
              </div>
              <h3 className="font-semibold mb-2">Instagram</h3>
              <p className="text-gray-300">@mavlonov.academy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Kursga yozilish</h3>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✅ Muvaffaqiyatli ro'yxatdan o'tdingiz! Tizimga kirishga yo'naltirilmoqda...
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ism</label>
                  <input type="text" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Ismingizni kiriting" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Familiya</label>
                  <input type="text" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Familiyangizni kiriting" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yosh</label>
                  <input type="number" value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Yoshingiz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqam</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="+998 90 123 45 67" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="email@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport ID</label>
                <input type="text" value={formData.passportId}
                  onChange={(e) => setFormData({ ...formData, passportId: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="AA1234567" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login (foydalanuvchi nomi)</label>
                <input type="text" value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="john_doe" />
                <p className="mt-1 text-sm text-gray-500">Faqat harflar, raqamlar va pastki chiziq</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parol yaratish</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Kamida 6 ta belgi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parolni tasdiqlash</label>
                  <input type="password" value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Parolni qayta kiriting" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="terms" checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Shartlarga roziman va ma'lumotlarimni taqdim etishga rozilik beraman
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
