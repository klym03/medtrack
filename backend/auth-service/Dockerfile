# Використовуємо офіційний образ Node.js LTS (Long Term Support)
FROM node:18-alpine

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json (або yarn.lock) для auth-service
COPY backend/auth-service/package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо код auth-service
COPY backend/auth-service/. ./

# Копіюємо спільну директорію
COPY shared ./shared

# Перевіряємо наявність user.entity.ts
RUN test -f /usr/src/app/shared/models/user.entity.ts && echo "user.entity.ts found" || (echo "user.entity.ts NOT found" && exit 1)

# Якщо ваш сервіс компілюється (наприклад, TypeScript -> JavaScript)
RUN npm run build && npx tsc-alias -p tsconfig.json

# Порт, на якому працює ваш додаток всередині контейнера
EXPOSE 3000

# Команда для запуску вашого додатку
CMD [ "npm", "run", "start:dev" ] 