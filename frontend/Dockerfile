# Frontend Dockerfile for GProA EDGE
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Serve with static files
EXPOSE 3000

CMD ["yarn", "start"]