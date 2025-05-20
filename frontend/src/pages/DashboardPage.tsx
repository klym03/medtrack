import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Панель управління</h1>
      {user && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Вітаємо, {user.name || user.email}!</h2>
          <p className="text-gray-600 mb-2">Ваш ID: {user.id}</p>
          <p className="text-gray-600">
            Статус профілю: {user.profileComplete ? 'Завершено' : 'Не завершено'}
          </p>
          {/* Сюди можна додати більше інформації та функціоналу для панелі управління */}
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 