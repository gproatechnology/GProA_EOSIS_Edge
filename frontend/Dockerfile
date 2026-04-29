# Frontend Dockerfile - GProA EDGE React App
# Multi-stage build for production

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Accept backend URL as build argument
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Copy package files
COPY package.json yarn.lock ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build static files with env vars
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Optional: custom nginx config (uncomment if nginx.conf exists)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]