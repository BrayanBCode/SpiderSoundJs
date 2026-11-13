FROM oven/bun:1.4-slim
WORKDIR /usr/src/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Bun ejecuta TypeScript directo: no hay paso de compilación ni dist/
COPY src ./src

CMD ["bun", "src/shards.ts"]
