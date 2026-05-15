import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { GraduationCap, ArrowLeft, X, AlertTriangle, UserX } from 'lucide-react';
import { getCourses, getUsers, updateUser, deleteUser, type User, type EnrolledCourse } from '../utils/data';

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
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [showCellModal, setShowCellModal] = useState(false);
  const [showStudentActions, setShowStudentActions] = useState<User | null>(null);
  const [cellAttendance, setCellAttendance] = useState<'present' | 'absent'>('present');
  const [cellGrade, setCellGrade] = useState('');
  const [cellError, setCellError] = useState('');
  const [saving, setSaving] = useState(false);

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

    // Sanalarni tayyorlaymiz
    const dateList: string[] = [];
    for (let i = 30; i >= -10; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateList.push(date.toISOString().split('T')[0]);
    }
    setDates(dateList);

    loadStudents();
  }, [navigate, courseId]);

  // ✅ async loadStudents
  const loadStudents = async () => {
    setLoading(true);
    const users = await getUsers();
    const enrolledStudents = users.filter(u =>
      !u.isAdmin && u.enrolledCourses.some(ec => ec.courseId === courseId)
    );
    setStudents(enrolledStudents);
    setLoading(false);
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
    if (user) setShowStudentActions(user);
  };

  // ✅ async handleSaveCell
  const handleSaveCell = async () => {
    if (!selectedCell) return;
    setCellError('');

    const gradeValue = cellGrade.trim() === '' ? undefined : Number(cellGrade);

    if (cellAttendance === 'absent' && gradeValue !== undefined) {
      setCellError("Agar Yo'q bo'lsa, baho bo'sh bo'lishi kerak.");
      return;
    }
    if (gradeValue !== undefined) {
      if (Number.isNaN(gradeValue)) {
        setCellError("Baho to'g'ri raqam bo'lishi kerak.");
        return;
      }
      if (gradeValue < 0 || gradeValue > 100) {
        setCellError("Baho 0 dan 100 gacha bo'lishi kerak.");
        return;
      }
    }
    if (selectedCell.isExam && cellAttendance === 'present' && gradeValue === undefined) {
      setCellError('Imtihon kunida baho majburiy.');
      return;
    }

    setSaving(true);

    // Studentni topamiz
    const student = students.find(s => s.id === selectedCell.userId);
    if (!student) { setSaving(false); return; }

    // enrolledCourses ni yangilaymiz
    const updatedCourses = student.enrolledCourses.map(ec => {
      if (ec.courseId !== courseId) return ec;

      const newAttendance = {
        date: selectedCell.date,
        present: cellAttendance === 'present',
        grade: cellAttendance === 'absent' ? undefined : gradeValue
      };

      const existingIndex = ec.attendance.findIndex(a => a.date === selectedCell.date);
      const updatedAttendance = [...ec.attendance];

      if (existingIndex !== -1) {
        updatedAttendance[existingIndex] = newAttendance;
      } else {
        updatedAttendance.push(newAttendance);
      }

      return { ...ec, attendance: updatedAttendance };
    });

    // Backendga saqlaymiz
    await updateUser(student.id, { enrolledCourses: updatedCourses });

    await loadStudents();
    setSaving(false);
    setShowCellModal(false);
  };

  // ✅ async handleRemoveStudent
  const handleRemoveStudent = async (userId: string) => {
    setSaving(true);
    const student = students.find(s => s.id === userId);
    if (!student) { setSaving(false); return; }

    const remainingCourses = student.enrolledCourses.filter(ec => ec.courseId !== courseId);

    if (remainingCourses.length === 0) {
      // Boshqa kursi yo'q — userni o'chiramiz
      await deleteUser(userId);
    } else {
      // Faqat bu kursdan chiqaramiz
      await updateUser(userId, { enrolledCourses: remainingCourses });
    }

    await loadStudents();
    setSaving(false);
    setShowStudentActions(null);
    alert("O'quvchi kursdan chiqarildi");
  };

  // ✅ async handleWarnStudent
  const handleWarnStudent = async (userId: string) => {
    setSaving(true);
    const student = students.find(s => s.id === userId);
    if (!student) { setSaving(false); return; }

    const updatedCourses = student.enrolledCourses.map(ec => {
      if (ec.courseId !== courseId) return ec;
      return { ...ec, warnings: (ec.warnings || 0) + 1 };
    });

    const newNotification = {
      id: Date.now().toString(),
      message: "Ogohlantirish: Dars qoldirish ko'paydi. Davom etsa kursdan chetlatilasiz.",
      date: new Date().toISOString(),
      read: false
    };

    const updatedNotifications = [...student.notifications, newNotification];

    await updateUser(userId, {
      enrolledCourses: updatedCourses,
      notifications: updatedNotifications
    });

    await loadStudents();
    setSaving(false);
    setShowStudentActions(null);
    alert("O'quvchiga ogohlantirish yuborildi");
  };

  const getCellData = (userId: string, date: string) => {
    const user = students.find(s => s.id === userId);
    if (!user) return null;
    const enrolled = user.enrolledCourses.find(ec => ec.courseId === courseId);
    if (!enrolled) return null;
    return enrolled.attendance.find(a => a.date === date);
  };

  const isExamDate = (date: string) => {
    const day = new Date(date).getDay();
    return day === 6; // Shanba — imtihon kuni
  };

  const getCellStyle = (userId: string, date: string) => {
    const data = getCellData(userId, date);
    if (!data) return 'bg-white hover:bg-gray-50';
    if (!data.present) return 'bg-red-100 hover:bg-red-200';
    if (data.grade !== undefined) return 'bg-blue-100 hover:bg-blue-200';
    return 'bg-green-100 hover:bg-green-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{course.name}</h1>
                <p className="text-blue-100">{course.instructor.name} • {students.length} o'quvchi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Jadval */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Davomat jadvali</h2>
            <p className="text-gray-600 text-sm mt-1">
              Katakchani bosing — davomat/baho kiriting. Ismni 2x bosing — o'quvchini boshqaring.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
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
                      className="px-4 py-3 text-sm font-medium text-gray-900 border-r sticky left-0 bg-white cursor-pointer hover:bg-blue-50"
                      onDoubleClick={() => handleCellDoubleClick(student.id)}
                      title="2x bosing — o'quvchini boshqarish"
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
                            <span className="text-red-600 font-bold">✗</span>
                          ) : cellData?.present ? (
                            <span className="text-green-600 font-bold">✓</span>
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
      </div>

      {/* Katakcha tahrirlash modali */}
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Davomat</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setCellError(''); setCellAttendance('present'); }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      cellAttendance === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bor ✓
                  </button>
                  <button
                    onClick={() => { setCellError(''); setCellAttendance('absent'); setCellGrade(''); }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      cellAttendance === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yo'q ✗
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
                {cellError && <p className="mt-2 text-sm text-red-600">{cellError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCell}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
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

      {/* O'quvchini boshqarish modali */}
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
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-60"
              >
                <AlertTriangle className="w-5 h-5" />
                {saving ? 'Yuborilmoqda...' : 'Ogohlantirish berish'}
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`${showStudentActions.firstName} ${showStudentActions.lastName}ni kursdan chiqarishni tasdiqlaysizmi?`)) {
                    handleRemoveStudent(showStudentActions.id);
                  }
                }}
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <UserX className="w-5 h-5" />
                {saving ? 'Chiqarilmoqda...' : 'Kursdan chiqarish'}
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
