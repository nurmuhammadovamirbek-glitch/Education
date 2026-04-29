import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Key, CheckCircle, XCircle } from 'lucide-react';
import { getUsers, saveUsers } from '../utils/data';

export function PasswordRecovery() {
  const navigate = useNavigate();
  const [passportId, setPassportId] = useState('');
  const [result, setResult] = useState<{
    found: boolean;
    login?: string;
    password?: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passportId) {
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.passportId === passportId);

    if (userIndex !== -1) {
      // User found - generate new password
      const newPassword = generatePassword();
      users[userIndex].password = newPassword;
      saveUsers(users);

      setResult({
        found: true,
        login: users[userIndex].login,
        password: newPassword
      });
    } else {
      // User not found
      setResult({
        found: false
      });
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parolni tiklash</h1>
          <p className="text-gray-600">Passport ID orqali login va yangi parol oling</p>
        </div>

        {/* Recovery Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport ID
                </label>
                <input
                  type="text"
                  value={passportId}
                  onChange={(e) => setPassportId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AA1234567"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ro'yxatdan o'tishda ko'rsatgan passport ID raqamingizni kiriting
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                Tiklash
              </button>
            </form>
          ) : result.found ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Muvaffaqiyatli!</h3>
                <p className="text-green-700">
                  Login va yangi parol yaratildi. Iltimos, ularni yozib oling.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Login:</p>
                  <p className="text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded border border-gray-200">
                    {result.login}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Yangi parol:</p>
                  <p className="text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded border border-gray-200">
                    {result.password}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Ushbu ma'lumotlarni xavfsiz joyda saqlang. Sahifani yopganingizdan keyin
                  ularni qayta ko'ra olmaysiz.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Tizimga kirish
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Foydalanuvchi topilmadi</h3>
                <p className="text-red-700">
                  Bunday passport ID bilan ro'yxatdan o'tgan foydalanuvchi mavjud emas.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Qaytadan urinish
                </button>

                <button
                  onClick={() => navigate('/courses')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Tizimga kirishga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
