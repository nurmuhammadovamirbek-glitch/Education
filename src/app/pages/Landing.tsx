import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Users, Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { initializeData } from '../utils/data';

export function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mavlonov Akademiyasi</h1>
              <p className="text-sm text-gray-600">Sifatli ta'limga yo'l</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Tizimga kirish
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Kelajagingizni bugun
              <span className="text-blue-600"> biz bilan</span> quring
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Mavlonov Akademiyasi - bu zamonaviy ta'lim, professional ustozlar va
              kafolatlangan natijalar. Matematika va ingliz tilini eng yuqori darajada o'rganing.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Kurslarni ko'rish
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <GraduationCap className="w-32 h-32 text-blue-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-800">Ta'lim - Kelajak Kaliti</p>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">1800+</h3>
            <p className="text-gray-600">Aktiv o'quvchilar</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">95%</h3>
            <p className="text-gray-600">Muvaffaqiyat ko'rsatkichi</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">12 yil</h3>
            <p className="text-gray-600">Tajriba</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">5</h3>
            <p className="text-gray-600">Maxsus kurslar</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Akademiya haqida
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Mavlonov Akademiyasi 2014 yilda tashkil etilgan bo'lib, bugungi kunda O'zbekistonning
            eng yetakchi ta'lim muassasalaridan biri hisoblanadi. Biz har bir o'quvchiga
            individual yondashuv, zamonaviy o'qitish metodlari va kafolatlangan natijalarni
            taqdim etamiz.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Maqsadimiz</h3>
              <p className="text-gray-600">
                Har bir o'quvchiga sifatli ta'lim berish va ularning kelajagini yorqin qilish
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-9 h-9 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sifat kafolati</h3>
              <p className="text-gray-600">
                Professional ustozlar, zamonaviy texnologiyalar va samarali dasturlar
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Jamoa</h3>
              <p className="text-gray-600">
                Tajribali va malakali o'qituvchilar jamoasi sizga yordam beradi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Bugun o'qishni boshlang!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Kurslarimiz bilan tanishing va o'zingizga mos yo'nalishni tanlang
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Kurslarni ko'rish
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Mavlonov Akademiyasi</h3>
              </div>
              <p className="text-gray-400">
                Sifatli ta'lim - yorqin kelajak
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Aloqa</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 +998 90 123 45 67</p>
                <p>📞 +998 91 234 56 78 (Call center)</p>
                <p>✉️ info@mavlonov-academy.uz</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ijtimoiy tarmoqlar</h4>
              <div className="space-y-2 text-gray-400">
                <p>📱 Telegram: @mavlonov_academy</p>
                <p>📷 Instagram: @mavlonov.academy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Mavlonov Akademiyasi. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
