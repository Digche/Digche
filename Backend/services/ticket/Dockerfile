FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 3004

CMD ["sh", "-c", "npm run db:migrate && npm start"]
