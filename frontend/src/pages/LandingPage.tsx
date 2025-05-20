import React from 'react';
import { Link } from 'react-router-dom';

// Поки що SVG іконка буде тут, пізніше можна винести в окремий компонент
const LogoIcon = () => (
  <svg className="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 12.5719L12 16.9999L4.5 12.5719V7.42793L12 3.00098L19.5 7.42793V12.5719Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16.9999V11.9999" stroke="currentColor" strokeWidth="2"/>
    <path d="M19.5 7.42793L12 11.9999L4.5 7.42793" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden font-sans"> {/* Замінив h-screen на min-h-screen для кращої адаптивності */}
      <div className="relative h-full bg-gradient-to-br from-primary-600 to-primary-900">
        {/* Навігаційне меню */}
        <nav className="relative z-10 px-4 sm:px-8 py-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <LogoIcon />
              </div>
              <span className="text-xl font-bold text-white">MEDTRACK AI</span>
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-white hover:text-white/80 transition-colors">Головна</a>
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Можливості</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">Про нас</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Контакти</a>
            </div>
            
            <div className="flex space-x-2">
              <Link to="/login" className="px-4 py-1 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-700 transition-colors">
                Увійти
              </Link>
              <Link to="/register" className="px-4 py-1 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors">
                Реєстрація
              </Link>
            </div>
          </div>
        </nav>

        {/* Основний контент */}
        <main className="relative z-10 pt-20 pb-20 flex items-center justify-center min-h-[calc(100vh-68px)]"> {/* Додав min-height для контенту */}
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Ваша персональна<br/>цифрова медична книга
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10">
              Зберігайте, аналізуйте та контролюйте свої медичні дані легко та безпечно з допомогою штучного інтелекту.
            </p>
            <Link to="/register" 
               className="inline-block bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-lg">
              Створити акаунт
            </Link>
          </div>
        </main>

        {/* Декоративні елементи */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-3xl opacity-20"></div>
      </div>
    </div>
  );
};

export default LandingPage; 