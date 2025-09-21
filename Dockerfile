# FROM oven/bun:1 AS base
# WORKDIR /app

# # Install dependencies into temp directory
# # This will cache them and speed up future builds
# FROM base AS install
# RUN mkdir -p /temp/dev
# COPY package.json bun.lock /temp/dev/
# RUN cd /temp/dev && bun install --frozen-lockfile && bun run prepare

# # Install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lock /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production && bun run prepare

# # Copy node_modules from temp directory
# # Then copy all (non-ignored) project files into the image
# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# # [optional] tests & build
# ENV NODE_ENV=production
# ARG DATABASE_URL
# ENV DATABASE_URL=$DATABASE_URL
# RUN bun run db:migrate
# RUN bun run build

# # Copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /app/package.json . 
# COPY --from=prerelease /app/build ./build
# COPY --from=prerelease /app/vite.config.ts ./vite.config.ts
# COPY --from=prerelease /app/svelte.config.js ./svelte.config.js
# COPY --from=prerelease /app/tsconfig.json ./tsconfig.json
# COPY --from=prerelease /app/.svelte-kit ./.svelte-kit

# # Expose port
# EXPOSE 3000
# EXPOSE 4173

# # Run the app
# CMD [ "bun", "run", "preview" ]

FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock

COPY . .

RUN bun install --frozen-lockfile && bun run prepare


ARG DATABASE_URL=postgresql://postgres:password@db:5432/life-fundamentals
ENV DATABASE_URL=$DATABASE_URL

# RUN bun run build

EXPOSE 3000
EXPOSE 5173
# HMR port?
EXPOSE 24678

# No default CMD - docker-compose will provide the command