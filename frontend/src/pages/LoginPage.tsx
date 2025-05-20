import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Помилка входу. Будь ласка, спробуйте ще раз.');
      console.error('Login failed in component:', err);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Увійти до системи
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Електронна пошта
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Пароль
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
              />
            </div>
            {/* TODO: Додати посилання "Забули пароль?" */}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Немає акаунта?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 