import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name?: string;
  // Додайте інші поля профілю, якщо вони є
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (accessToken: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const fetchUserProfile = async (accessToken: string): Promise<User | null> => {
    if (!accessToken) return null;
    try {
      const userProfile = await authService.getProfile(accessToken);
      setUser(userProfile);
      localStorage.setItem('authUser', JSON.stringify(userProfile));
      return userProfile;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      // Якщо помилка "Unauthorized" або схожа, це означає, що токен недійсний
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        clearAuthData(); // Очищаємо дані, оскільки токен не валідний
      }
      // Не перекидаємо помилку далі, щоб не переривати потік авто-логіну,
      // але можна обробити її для відображення повідомлення користувачу.
      return null;
    }
  };

  useEffect(() => {
    const attemptAutoLogin = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Опціонально: валідувати токен/профіль з бекендом навіть якщо є в localStorage
            // await fetchUserProfile(storedToken); // Це оновить дані користувача
          } catch (e) {
            console.error("Failed to parse stored user, clearing data.", e);
            clearAuthData(); // Якщо дані користувача пошкоджені
          }
        } else {
          // Якщо немає користувача в localStorage, але є токен, спробуємо завантажити профіль
          await fetchUserProfile(storedToken);
        }
      } else {
        clearAuthData();
      }
      setIsLoading(false);
    };
    attemptAutoLogin();
  }, []); // Запускаємо тільки при монтуванні

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setToken(data.accessToken);
      localStorage.setItem('authToken', data.accessToken);
      await fetchUserProfile(data.accessToken); // Завантажуємо профіль після логіну
    } catch (error) {
      console.error('Login failed:', error);
      clearAuthData(); // Очищаємо дані у випадку помилки логіну
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authService.register(email, password);
      // Після успішної реєстрації, користувач зазвичай має увійти
      // або API може одразу повертати токен (залежить від реалізації бекенду)
      console.log('Registration successful. Please log in.');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    // Тут можна було б викликати API /logout, якщо він є
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, register, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 