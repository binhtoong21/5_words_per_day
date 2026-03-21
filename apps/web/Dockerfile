FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx config is mounted via docker-compose, but we can have a fallback here if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
