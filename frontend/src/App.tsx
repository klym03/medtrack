import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage'; // Імпортуємо створену сторінку
import LoginPage from './pages/LoginPage'; // Імпортуємо створену сторінку логіну
import RegisterPage from './pages/RegisterPage'; // Імпортуємо створену сторінку реєстрації
import LayoutComponent from './components/Layout/LayoutComponent'; // Імпортуємо LayoutComponent
import DashboardPage from './pages/DashboardPage'; // Імпорт DashboardPage
import ProtectedRoute from './components/ProtectedRoute'; // Імпорт ProtectedRoute

// Уявімо, що це майбутня сторінка дашборду, яка також використовуватиме Layout
// const DashboardPage = () => <div>Dashboard Placeholder (Protected)</div>;

// Тимчасові компоненти сторінок для прикладу
// const HomePage = () => <div><h2>Home Page</h2><nav><Link to="/login">Login</Link> | <Link to="/register">Register</Link></nav></div>;

const App: React.FC = () => {
  return (
    <Routes>
      {/* Маршрути, що не використовують LayoutComponent */}
      <Route path="/" element={<LandingPage />} /> {/* Використовуємо LandingPage */}

      {/* Маршрути, що використовують LayoutComponent */}
      <Route element={<LayoutComponent><Outlet /></LayoutComponent>}>
        <Route path="login" element={<LoginPage />} /> {/* Використовуємо LoginPage */}
        <Route path="register" element={<RegisterPage />} /> {/* Використовуємо RegisterPage */}
        
        {/* Захищений маршрут для панелі управління */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* 
          Інші захищені маршрути можна додати тут, наприклад:
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> 
          <Route path="analyses" element={<ProtectedRoute><AnalysesListPage /></ProtectedRoute>} /> 
          <Route path="analyses/new" element={<ProtectedRoute><NewAnalysisPage /></ProtectedRoute>} /> 
          <Route path="analyses/:id" element={<ProtectedRoute><AnalysisDetailPage /></ProtectedRoute>} /> 
        */}
        
        {/* Можна додати маршрут 404 Not Found тут, якщо потрібно */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
};

export default App;
