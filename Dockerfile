# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run stage (static file server)
FROM node:22-alpine AS run
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
ENV PORT=4173
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
