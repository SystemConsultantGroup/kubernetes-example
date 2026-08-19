FROM node:24.19.0-alpine

WORKDIR /app

COPY --chown=1000:1000 package.json ./
COPY --chown=1000:1000 index.js ./

USER 1000:1000

EXPOSE 8080

CMD ["node", "index.js"]
