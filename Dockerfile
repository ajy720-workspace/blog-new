# Boiler Plate Next.js Application Dockerfile

# --- Builder Stage ---
FROM node:20-alpine AS builder
LABEL maintainer="example@example.com"

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code and build the application
COPY . .

# Build the application
RUN yarn build

# --- Runner Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application (for standalone mode)
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000
ENV PORT 3000

# Start the application
CMD ["node", "server.js"]