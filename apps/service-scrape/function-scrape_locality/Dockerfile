FROM node:24.11.1-trixie-slim

WORKDIR /app
COPY ./src/asset /app/asset
COPY ./package.json /app/package.json
COPY ./dist /app

CMD ["node", "/app/index.js"]
