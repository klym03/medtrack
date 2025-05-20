import React, { type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Виправлено шлях імпорту
import logoMedtrack from '../../assets/images/logo_medtrack.png'; // Імпортуємо логотип

// Припустимо, у нас є хук або контекст для стану автентифікації
// import { useAuth } from '../contexts/AuthContext'; // Приклад

// SVG логотип більше не потрібен тут, якщо використовуємо зображення
// const LogoIcon = () => ( ... );

interface LayoutComponentProps {
  children: ReactNode;
}

const LayoutComponent: React.FC<LayoutComponentProps> = ({ children }) => {
  const { isAuthenticated, user, logout, isLoading } = useAuth(); // Отримуємо реальні дані з AuthContext
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout(); // Викликаємо logout з AuthContext
    navigate('/login');
  };

  if (isLoading) {
    // Можна показати глобальний лоадер або просто порожній екран, поки завантажується стан автентифікації
    return <div className="min-h-screen flex items-center justify-center"><p>Завантаження...</p></div>;
  }

  return (
    <div className="bg-gray-50 font-sans flex flex-col min-h-screen antialiased bg-grid-pattern bg-grid-size"> {/* Додано класи для фону */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex-shrink-0 flex items-center">
              <img src={logoMedtrack} alt="Medtrack AI Logo" className="h-8 w-8 mr-2" /> {/* Використовуємо імпортоване лого */}
              <span className="text-xl font-display font-bold text-primary-600">MEDTRACK AI</span>
            </Link>

            <div className="hidden md:flex md:items-center md:space-x-8">
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600" + " px-3 py-2 rounded-md text-sm font-medium transition-colors"}>Кабінет</NavLink>
                  <NavLink to="/history" className={({ isActive }) => isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600" + " px-3 py-2 rounded-md text-sm font-medium transition-colors"}>Історія</NavLink>
                  <NavLink to="/help" className={({ isActive }) => isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600" + " px-3 py-2 rounded-md text-sm font-medium transition-colors"}>Допомога</NavLink>
                  {user && (
                    <span className="text-sm text-gray-600">Вітаємо, {user.name || user.email}!</span>
                  )}
                </>
              ) : (
                <>
                  {/* Для неавтентифікованих користувачів, можливо, деякі з цих посилань не потрібні в хедері, якщо вони є на LandingPage */}
                  <NavLink to="/" className={({ isActive }) => isActive ? "text-primary-600 font-medium" : "text-gray-700 hover:text-primary-600" + " px-3 py-2 rounded-md text-sm font-medium transition-colors"}>Головна</NavLink>
                  {/* <NavLink to="/#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Можливості</NavLink> */}
                  {/* <NavLink to="/#problem" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Проблема</NavLink> */}
                </>
              )}
            </div>

            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                >
                  Вийти
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors mr-4">
                    Увійти
                  </Link>
                  <Link to="/register" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">
                    Зареєструватися
                  </Link>
                </>
              )}
            </div>
            {/* TODO: Додати кнопку для мобільного меню */}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TODO: Система Flash-повідомлень */}
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Medtrack AI. Всі права захищено.
        </div>
      </footer>
    </div>
  );
};

export default LayoutComponent; 