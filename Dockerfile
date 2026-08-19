FROM node:24.19.0-alpine

WORKDIR /app

COPY --chown=node:node package.json ./
COPY --chown=node:node index.js ./

USER node

EXPOSE 8080

CMD ["node", "index.js"]
