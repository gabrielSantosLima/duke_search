FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm run lint

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app /app
EXPOSE 3333
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm prisma generate --sql && pnpm start"]
