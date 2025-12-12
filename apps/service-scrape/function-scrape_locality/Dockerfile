FROM --platform=linux/arm64 node:24.11.1-trixie-slim

WORKDIR /app
COPY ./chromium /chromium
COPY ./package.json /app/package.json
COPY ./dist /app

CMD ["node", "/app/index.js"]
