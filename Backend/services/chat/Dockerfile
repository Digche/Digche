FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 3003

USER node

CMD ["sh", "-c", "npm run db:migrate && npm start"]
