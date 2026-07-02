# syntax=docker/dockerfile:1.7

# Blog(new) Next.js Application Dockerfile

# --- Builder Stage ---
FROM node:22 AS builder
LABEL maintainer="ajy720@gmail.com"

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code and build the application
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build the application
RUN --mount=type=secret,id=NOTION_DATABASE_ID,env=NOTION_DATABASE_ID \
    --mount=type=secret,id=NOTION_API_KEY,env=NOTION_API_KEY \
    --mount=type=secret,id=REVALIDATE_SECRET,env=REVALIDATE_SECRET \
    --mount=type=secret,id=NOTION_WEBHOOK_SECRET,env=NOTION_WEBHOOK_SECRET \
    yarn build

# --- Runner Stage ---
FROM node:22 AS runner
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
