# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY site/nextjs-terminal-site/package.json site/nextjs-terminal-site/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source
COPY site/nextjs-terminal-site/ .
COPY content/ ../../content/

# Build static export
RUN npm run build

# Stage 2: Runner
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static output
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
