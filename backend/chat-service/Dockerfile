# Використовуємо офіційний образ Node.js LTS (Long Term Support)
FROM node:18-alpine

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json (або yarn.lock) для chat-service
COPY backend/chat-service/package*.json ./

# Встановлюємо залежності
RUN npm install

# Перевіряємо встановлені ключові залежності
RUN npm list typeorm @nestjs/passport

# Копіюємо код chat-service
COPY backend/chat-service/. ./

# Копіюємо спільну директорію
COPY shared ./shared

# Якщо ваш сервіс компілюється (наприклад, TypeScript -> JavaScript)
RUN npm run build && npx tsc-alias -p tsconfig.json

# Порт, на якому працює ваш додаток всередині контейнера
EXPOSE 3002

# Команда для запуску вашого додатку
CMD [ "npm", "run", "start:dev" ] 