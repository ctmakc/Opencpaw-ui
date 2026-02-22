FROM node:22-alpine AS base
WORKDIR /app

# Install server deps
COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

# Build frontend
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Copy built server source (using tsx at runtime — simpler than tsc for now)
# Install tsx for runtime
RUN npm ci --prefix server

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=base /app/server ./server
COPY --from=base /app/dist   ./dist

WORKDIR /app/server
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

CMD ["node_modules/.bin/tsx", "src/index.ts"]
