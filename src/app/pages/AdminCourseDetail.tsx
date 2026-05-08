import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GraduationCap, ArrowLeft, X, AlertTriangle, UserX } from 'lucide-react';
import { getCourses, getUsers, saveUsers, type User, type EnrolledCourse } from '../utils/data';

interface CellData {
  userId: string;
  date: string;
  present?: boolean;
  grade?: number;
  isExam?: boolean;
}

export function AdminCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [students, setStudents] = useState<User[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [showCellModal, setShowCellModal] = useState(false);
  const [showStudentActions, setShowStudentActions] = useState<User | null>(null);
  const [cellAttendance, setCellAttendance] = useState<'present' | 'absent'>('present');
  const [cellGrade, setCellGrade] = useState('');
  const [cellError, setCellError] = useState('');

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

    loadStudents();
  }, [navigate, courseId]);

  const loadStudents = () => {
    const users = getUsers();
    const enrolledStudents = users.filter(u =>
      !u.isAdmin && u.enrolledCourses.some(ec => ec.courseId === courseId)
    );
    setStudents(enrolledStudents);

    // Generate dates (last 30 days + next 10 days)
    const dateList: string[] = [];
    for (let i = 30; i >= -10; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateList.push(date.toISOString().split('T')[0]);
    }
    setDates(dateList);
  };

  const course = getCourses().find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Kurs topilmadi</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const handleCellClick = (userId: string, date: string, isExam: boolean = false) => {
    setSelectedCell({ userId, date, isExam });
    setCellError('');

    const user = students.find(s => s.id === userId);
    if (!user) return;

    const enrolled = user.enrolledCourses.find(ec => ec.courseId === courseId);
    if (!enrolled) return;

    const attendance = enrolled.attendance.find(a => a.date === date);

    if (attendance) {
      setCellAttendance(attendance.present ? 'present' : 'absent');
      setCellGrade(attendance.present ? attendance.grade?.toString() || '' : '');
    } else {
      setCellAttendance('present');
      setCellGrade('');
    }

    setShowCellModal(true);
  };

  const handleCellDoubleClick = (userId: string) => {
    const user = students.find(s => s.id === userId);
    if (user) {
      setShowStudentActions(user);
    }
  };

  const handleSaveCell = () => {
    if (!selectedCell) return;
    setCellError('');

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === selectedCell.userId);
    if (userIndex === -1) return;

    const enrolledIndex = users[userIndex].enrolledCourses.findIndex(ec => ec.courseId === courseId);
    if (enrolledIndex === -1) return;

    const gradeValue = cellGrade.trim() === '' ? undefined : Number(cellGrade);

    if (cellAttendance === 'absent' && gradeValue !== undefined) {
      setCellError('Agar Yo\'q bo\'lsa, baho bo\'sh bo\'lishi kerak.');
      return;
    }

    if (gradeValue !== undefined) {
      if (Number.isNaN(gradeValue)) {
        setCellError('Baho to\'g\'ri raqam bo\'lishi kerak.');
        return;
      }
      if (gradeValue < 0 || gradeValue > 100) {
        setCellError('Baho 0 dan 100 gacha bo\'lishi kerak.');
        return;
      }
    }

    if (selectedCell.isExam && cellAttendance === 'present' && gradeValue === undefined) {
      setCellError('Imtihon kunida baho majburiy.');
      return;
    }

    const attendanceIndex = users[userIndex].enrolledCourses[enrolledIndex].attendance.findIndex(
      a => a.date === selectedCell.date
    );

    const newAttendance = {
      date: selectedCell.date,
      present: cellAttendance === 'present',
      grade: cellAttendance === 'absent' ? undefined : gradeValue
    };

    if (attendanceIndex !== -1) {
      users[userIndex].enrolledCourses[enrolledIndex].attendance[attendanceIndex] = newAttendance;
    } else {
      users[userIndex].enrolledCourses[enrolledIndex].attendance.push(newAttendance);
    }

    saveUsers(users);
    loadStudents();
    setShowCellModal(false);
  };

  const handleRemoveStudent = (userId: string) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    // Remove course from enrolled courses
    users[userIndex].enrolledCourses = users[userIndex].enrolledCourses.filter(
      ec => ec.courseId !== courseId
    );

    // If no more courses, delete account
    if (users[userIndex].enrolledCourses.length === 0) {
      users.splice(userIndex, 1);
    }

    saveUsers(users);
    loadStudents();
    setShowStudentActions(null);
    alert('O\'quvchi kursdan chiqarildi');
  };

  const handleWarnStudent = (userId: string) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const enrolledIndex = users[userIndex].enrolledCourses.findIndex(ec => ec.courseId === courseId);
    if (enrolledIndex === -1) return;

    users[userIndex].enrolledCourses[enrolledIndex].warnings += 1;

    // Add notification
    users[userIndex].notifications.push({
      id: Date.now().toString(),
      message: `Ogohlantirish: Dars qoldirish ko'paydi. Davom etsa kursdan chetlatilasiz.`,
      date: new Date().toISOString(),
      read: false
    });

    saveUsers(users);
    loadStudents();
    setShowStudentActions(null);
    alert('O\'quvchiga ogohlantirish yuborildi');
  };

  const getCellData = (userId: string, date: string) => {
    const user = students.find(s => s.id === userId);
    if (!user) return null;

    const enrolled = user.enrolledCourses.find(ec => ec.courseId === courseId);
    if (!enrolled) return null;

    return enrolled.attendance.find(a => a.date === date);
  };

  const getCellStyle = (userId: string, date: string) => {
    const data = getCellData(userId, date);

    if (!data) {
      return 'bg-white hover:bg-gray-50';
    }

    if (!data.present) {
      return 'bg-red-500 text-white';
    }

    if (data.grade !== undefined) {
      return 'bg-blue-500 text-white';
    }

    return 'bg-white hover:bg-gray-50';
  };

  const isExamDate = (date: string) => {
    const day = new Date(date).getDate();
    return day % 10 === 0; // Every 10th day is exam
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{course.name}</h1>
                <p className="text-blue-100">{students.length} o'quvchi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yo'riqnoma:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
              <span className="text-gray-700">Oq - ma'lumot yo'q</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-gray-700">Qizil - yo'q</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span className="text-gray-700">Ko'k - baho qo'yilgan</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            • Katak ustiga bir marta bosing - davomat va baho kiritish<br />
            • O'quvchi ustiga ikki marta bosing - boshqarish (ogohlantirish/chiqarish)
          </p>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r sticky left-0 bg-gray-50 z-10">
                  O'quvchi
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className={`px-3 py-3 text-center text-xs font-medium text-gray-700 min-w-[80px] ${
                      isExamDate(date) ? 'bg-yellow-100' : ''
                    }`}
                  >
                    {new Date(date).toLocaleDateString('uz-UZ', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                    {isExamDate(date) && (
                      <div className="text-xs text-yellow-700 mt-1">IMTIHON</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td
                    className="px-4 py-3 text-sm font-medium text-gray-900 border-r sticky left-0 bg-white cursor-pointer"
                    onDoubleClick={() => handleCellDoubleClick(student.id)}
                  >
                    {student.firstName} {student.lastName}
                  </td>
                  {dates.map((date) => {
                    const cellData = getCellData(student.id, date);
                    const isExam = isExamDate(date);

                    return (
                      <td
                        key={date}
                        className={`px-3 py-3 text-center text-sm cursor-pointer border ${getCellStyle(student.id, date)}`}
                        onClick={() => handleCellClick(student.id, date, isExam)}
                      >
                        {cellData?.grade !== undefined ? (
                          <span className="font-semibold">{cellData.grade}</span>
                        ) : cellData?.present === false ? (
                          <span>✗</span>
                        ) : cellData?.present ? (
                          <span>✓</span>
                        ) : (
                          ''
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Bu kursda o'quvchilar yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Cell Edit Modal */}
      {showCellModal && selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {selectedCell.isExam ? 'Baho kiritish' : 'Davomat va baho'}
              </h3>
              <button
                onClick={() => setShowCellModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Davomat
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setCellError('');
                      setCellAttendance('present');
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      cellAttendance === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bor
                  </button>
                  <button
                    onClick={() => {
                      setCellError('');
                      setCellAttendance('absent');
                      setCellGrade('');
                    }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      cellAttendance === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yo'q
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baho {selectedCell.isExam ? '(imtihon kuni uchun majburiy)' : '(ixtiyoriy)'}
                </label>
                <input
                  type="number"
                  value={cellGrade}
                  onChange={(e) => setCellGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  disabled={cellAttendance === 'absent'}
                />
                {cellAttendance === 'absent' ? (
                  <p className="mt-1 text-sm text-gray-500">Yo'q bo'lsa, baho kiritilmaydi.</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Bahoni 0 dan 100 gacha kiriting.</p>
                )}
                {cellError && (
                  <p className="mt-2 text-sm text-red-600">{cellError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCell}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg"
                >
                  Saqlash
                </button>
                <button
                  onClick={() => setShowCellModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Actions Modal */}
      {showStudentActions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">O'quvchini boshqarish</h3>
              <button
                onClick={() => setShowStudentActions(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">O'quvchi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {showStudentActions.firstName} {showStudentActions.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Ogohlantirishlar:{' '}
                  {showStudentActions.enrolledCourses.find(ec => ec.courseId === courseId)?.warnings || 0}
                </p>
              </div>

              <button
                onClick={() => handleWarnStudent(showStudentActions.id)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                <AlertTriangle className="w-5 h-5" />
                Ogohlantirish berish
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`${showStudentActions.firstName} ${showStudentActions.lastName}ni kursdan chiqarishni tasdiqlaysizmi?`)) {
                    handleRemoveStudent(showStudentActions.id);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <UserX className="w-5 h-5" />
                Kursdan chiqarish
              </button>

              <button
                onClick={() => setShowStudentActions(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
