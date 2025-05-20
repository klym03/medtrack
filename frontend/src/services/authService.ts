const API_URL = 'http://localhost:8080/api/auth'; // URL вашого API шлюзу для auth сервісу

interface LoginResponse {
  accessToken: string;
  // Можливо, сюди також приходить інформація про користувача
}

interface RegisterResponse {
  // Залежить від того, що повертає ваш API при реєстрації
  // Можливо, теж accessToken або просто повідомлення про успіх
  id: string;
  email: string;
  // ... інші поля користувача, якщо вони повертаються
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Помилка логіну' }));
      throw new Error(errorData.message || 'Помилка сервера при логіні');
    }
    return response.json();
  },

  register: async (email: string, password: string /*, name?: string */): Promise<RegisterResponse> => {
    // Якщо ваш API очікує ім'я або інші поля, додайте їх сюди
    const payload: any = { email, password };
    // if (name) payload.name = name;

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Помилка реєстрації' }));
      throw new Error(errorData.message || 'Помилка сервера при реєстрації');
    }
    return response.json();
  },

  // Можна додати функцію для виходу (logout), якщо API має такий ендпоінт
  // logout: async (): Promise<void> => { ... }

  // Можна додати функцію для отримання профілю користувача, якщо потрібно
  getProfile: async (token: string): Promise<any> => { // TODO: Define a proper User interface here or import from context
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Помилка отримання профілю' }));
      // Якщо токен недійсний (401, 403), це потрібно обробити окремо в AuthContext
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: Invalid token');
      }
      throw new Error(errorData.message || 'Помилка сервера при отриманні профілю');
    }
    return response.json();
  },
}; 