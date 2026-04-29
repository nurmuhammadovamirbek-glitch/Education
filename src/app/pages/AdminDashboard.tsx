import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, LogOut, BookOpen, Users } from 'lucide-react';
import { getCourses, getUsers, type User } from '../utils/data';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr) as User;

    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    setCurrentUser(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!currentUser) {
    return null;
  }

  const courses = getCourses();
  const users = getUsers();

  // Calculate statistics for each course
  const courseStats = courses.map(course => {
    const enrolledUsers = users.filter(u =>
      u.enrolledCourses.some(ec => ec.courseId === course.id)
    );

    return {
      ...course,
      enrolledCount: enrolledUsers.length
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-blue-100">Mavlonov Akademiyasi</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Kurslar bo'limi</h2>
          <p className="text-gray-600">Kursni tanlang va o'quvchilarni boshqaring</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseStats.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/admin/course/${course.id}`)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold">{course.name}</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-blue-100 line-clamp-2">{course.description}</p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">O'quvchilar</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{course.enrolledCount}</span>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Ustoz</p>
                  <p className="font-medium text-gray-900">{course.instructor.name}</p>
                  <p className="text-sm text-gray-500">{course.instructor.experience}</p>
                </div>

                <button className="w-full mt-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Batafsil ko'rish →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Statistics */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Umumiy statistika</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-gray-600">Kurslar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{users.filter(u => !u.isAdmin).length}</p>
              <p className="text-gray-600">O'quvchilar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {courses.reduce((sum, c) => sum + c.studentsCompleted, 0)}
              </p>
              <p className="text-gray-600">Bitirganlar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">95%</p>
              <p className="text-gray-600">Muvaffaqiyat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
