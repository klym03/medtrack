# Використовуємо офіційний образ Node.js LTS (Long Term Support)
FROM node:18-alpine

# Встановлюємо системні залежності, необхідні для node-gyp та canvas
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json (або yarn.lock) для analysis-service
COPY backend/analysis-service/package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо код analysis-service
COPY backend/analysis-service/. ./

# Копіюємо спільну директорію
COPY shared ./shared

# Якщо ваш сервіс компілюється (наприклад, TypeScript -> JavaScript)
RUN npm run build && npx tsc-alias -p tsconfig.json

# Порт, на якому працює ваш додаток всередині контейнера
EXPOSE 3001

# Команда для запуску вашого додатку
CMD [ "npm", "run", "start:dev" ] 