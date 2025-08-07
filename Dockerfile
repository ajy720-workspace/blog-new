# Blog(new) Next.js Application Dockerfile

# --- Builder Stage ---
FROM node:20 AS builder
LABEL maintainer="ajy720@gmail.com"

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
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application (for standalone mode)
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Create empty public directory (Next.js will serve from here)
RUN mkdir -p ./public

# Expose port
EXPOSE 3000
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]