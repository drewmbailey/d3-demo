# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./ 2>/dev/null || true
RUN npm i -g pnpm && pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm build

# Run stage (static preview via Vite)
FROM node:22-alpine AS run
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json .
RUN npm i -g vite@latest
ENV PORT=4173
EXPOSE 4173
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
