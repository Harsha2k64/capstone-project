FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production

FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

RUN rm -f .env .env.example

USER nodeuser

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/routes/router.js"]