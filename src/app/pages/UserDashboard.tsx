import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  GraduationCap,
  Bell,
  User,
  BookOpen,
  TrendingUp,
  Calendar,
  DollarSign,
  LogOut,
  Award,
  X
} from 'lucide-react';
import { getCourses, getUsers, saveUsers, type User as UserType } from '../utils/data';

export function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'results' | 'payments'>('profile');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr) as UserType;

    // Sync with latest data
    const users = getUsers();
    const latestUser = users.find(u => u.id === user.id);

    if (!latestUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(latestUser);
    setUnreadCount(latestUser.notifications.filter(n => !n.read).length);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].notifications = users[userIndex].notifications.map(n => ({ ...n, read: true }));
      saveUsers(users);
      setCurrentUser(users[userIndex]);
      setUnreadCount(0);
    }
  };

  if (!currentUser) {
    return null;
  }

  const courses = getCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mavlonov Akademiyasi</h1>
                <p className="text-sm text-gray-600">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    markNotificationsAsRead();
                  }
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900">Bildirishnomalar</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y">
            {currentUser.notifications.length > 0 ? (
              currentUser.notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.date).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Bildirishnomalar yo'q
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Kurslar
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Natijalar
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              To'lovlar
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shaxsiy ma'lumotlar</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Ism</label>
                  <p className="text-lg text-gray-900">{currentUser.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Familiya</label>
                  <p className="text-lg text-gray-900">{currentUser.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Yosh</label>
                  <p className="text-lg text-gray-900">{currentUser.age}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Telefon</label>
                  <p className="text-lg text-gray-900">{currentUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                  <p className="text-lg text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Passport ID</label>
                  <p className="text-lg text-gray-900">{currentUser.passportId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Login</label>
                  <p className="text-lg text-gray-900 font-mono">{currentUser.login}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mening kurslarim</h2>
              {currentUser.enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {currentUser.enrolledCourses.map((enrolled) => {
                    const course = courses.find(c => c.id === enrolled.courseId);
                    if (!course) return null;

                    return (
                      <div key={enrolled.courseId} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                            <p className="text-gray-600 mt-1">{course.description}</p>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Boshlangan sana</p>
                              <p className="font-medium text-gray-900">{enrolled.enrolledDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-600">Ustoz</p>
                              <p className="font-medium text-gray-900">{enrolled.instructorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-600">Davomat</p>
                              <p className="font-medium text-gray-900">
                                {enrolled.attendance.filter(a => a.present).length} / {enrolled.attendance.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Siz hali hech qanday kursga yozilmagansiz</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Kurslarni ko'rish
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Natijalar va davomat</h2>
              {currentUser.enrolledCourses.length > 0 ? (
                <div className="space-y-6">
                  {currentUser.enrolledCourses.map((enrolled) => {
                    const course = courses.find(c => c.id === enrolled.courseId);
                    if (!course) return null;

                    const averageScore = enrolled.results.length > 0
                      ? enrolled.results.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / enrolled.results.length
                      : 0;

                    const attendanceRate = enrolled.attendance.length > 0
                      ? (enrolled.attendance.filter(a => a.present).length / enrolled.attendance.length) * 100
                      : 0;

                    return (
                      <div key={enrolled.courseId} className="border border-gray-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{course.name}</h3>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 mb-1">O'rtacha ball</p>
                            <p className="text-3xl font-bold text-blue-900">
                              {averageScore.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 mb-1">Davomat</p>
                            <p className="text-3xl font-bold text-green-900">
                              {attendanceRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {enrolled.results.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Imtihon natijalari</h4>
                            <div className="space-y-2">
                              {enrolled.results.map((result, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">{result.date}</span>
                                  <span className="font-semibold text-gray-900">
                                    {result.score} / {result.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Natijalar mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">To'lovlar</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Qarz</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-900">
                    {currentUser.debt.toLocaleString()} so'm
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Keyingi to'lov</h3>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {currentUser.nextPaymentDate || 'Belgilanmagan'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">To'lov jadvali</h3>
                {currentUser.enrolledCourses.length > 0 ? (
                  <div className="space-y-3">
                    {currentUser.enrolledCourses.map((enrolled) => {
                      const course = courses.find(c => c.id === enrolled.courseId);
                      if (!course) return null;

                      return (
                        <div key={enrolled.courseId} className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-900">{course.name}</span>
                          <span className="font-semibold text-gray-900">
                            {course.monthlyPrice.toLocaleString()} so'm / oy
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">To'lov jadvali mavjud emas</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
