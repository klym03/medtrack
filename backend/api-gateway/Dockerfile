# Використовуємо офіційний образ Node.js LTS (Long Term Support)
FROM node:18-alpine

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json (або yarn.lock) для api-gateway
COPY backend/api-gateway/package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо код api-gateway
COPY backend/api-gateway/. ./

# Копіюємо спільну директорію
COPY shared ./shared

# Перевіряємо наявність ключового файлу з shared (приклад, замініть на реальний, якщо потрібно)
# RUN test -f /usr/src/app/shared/some-file.ts && echo "shared file found" || (echo "shared file NOT found" && exit 1)

# Якщо ваш сервіс компілюється (наприклад, TypeScript -> JavaScript)
RUN npm run build && npx tsc-alias -p tsconfig.json

# Порт, на якому працює ваш додаток всередині контейнера
EXPOSE 3005

# Команда для запуску вашого додатку
CMD [ "npm", "run", "start:dev" ] 