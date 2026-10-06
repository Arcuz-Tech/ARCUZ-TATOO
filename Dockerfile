FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /app/data/uploads && chown -R node:node /app
USER node
EXPOSE 4187
CMD ["sh", "-c", "node src/migrate.js && node src/seed.js && node src/server.js"]
