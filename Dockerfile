# The whole app's images, built by docker-compose.yml: `--target server` (the NestJS server, which applies the Prisma
# migrations on start) and `--target client` (the game built by Vite, served by nginx).

FROM node:22-slim AS deps
# Prisma's schema engine, which runs the migrations, needs OpenSSL.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@12.9.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY client/package.json client/
COPY client/traits/package.json client/traits/
# The server's postinstall runs `prisma generate`, which reads the schema.
COPY server/package.json server/prisma.config.ts server/
COPY server/prisma server/prisma
RUN pnpm install --frozen-lockfile

FROM deps AS server-build
COPY server server
RUN pnpm --filter ./server build

FROM server-build AS server
ENV NODE_ENV=production
WORKDIR /app/server
EXPOSE 6868
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]

FROM deps AS client-build
# Read by Vite at build time: the sign-in button's OAuth client ID, and the server reached through nginx.
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_SERVER_URL=/api
COPY client client
RUN pnpm --filter ./client build

FROM nginx:1.27-alpine AS client
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
