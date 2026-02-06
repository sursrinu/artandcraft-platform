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

# Use sed to replace port 80 with $PORT at runtime
CMD sh -c "sed -i 's/listen 80/listen '\$PORT'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
