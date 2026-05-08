import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';
import { getUsers, initializeData } from '../utils/data';

export function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!login || !password) {
      setError('Login va parolni kiriting');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.login === login && u.password === password);

    if (user) {
      // Successful login
      setAttempts(0);
      localStorage.setItem('currentUser', JSON.stringify(user));

      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      
      setAttempts(prev=>prev+1);

      if (attempts+1 >= 3) {
        setError('Login yoki parol noto\'g\'ri. Agar ma\'lumotlaringizni unutgan bo\'lsangiz, "Login yoki parolni unutdingizmi?" tugmasini bosing.');
      } else {
        setError(`Login yoki parol noto'g'ri. ${3 - (attempts+1)} ta urinish qoldi.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mavlonov Akademiyasi</h1>
          <p className="text-gray-600">Tizimga kirish</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Loginingizni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Parolingizni kiriting"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Kirish
            </button>

            {attempts >= 3 && (
              <button
                type="button"
                onClick={() => navigate('/password-recovery')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Login yoki parolni unutdingizmi?
              </button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Hali ro'yxatdan o'tmaganmisiz?{' '}
              <button
                onClick={() => navigate('/courses')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Kursga yozilish
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Bosh sahifaga qaytish
            </button>
          </div>
        </div>

       
        
          
        </div>
      </div>
    
  );
}
