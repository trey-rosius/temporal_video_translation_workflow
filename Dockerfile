# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim

# Install runtime dependencies (FFmpeg)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Use non-root user for security
USER node

# Start the worker using the compiled code
CMD ["npm", "start"]
