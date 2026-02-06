# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Override entrypoint to use our startup script
ENTRYPOINT []
CMD ["/start.sh"]
