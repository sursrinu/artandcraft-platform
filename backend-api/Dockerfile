# Dockerfile for Node.js API
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy all application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
