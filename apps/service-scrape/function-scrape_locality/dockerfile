FROM --platform=linux/arm64 node:24.12.0-trixie-slim

WORKDIR /app

# Better debugging
ENV NODE_OPTIONS=--enable-source-maps

# Clean package manager
RUN apt clean &&\
    rm -R /var/lib/apt/lists/* &&\
    echo 'Acquire::http::Pipeline-Depth 0;\nAcquire::http::No-Cache true;\nAcquire::BrokenProxy true;' >  /etc/apt/apt.conf.d/99fixbadproxy &&\
    apt update

# Lock playwright version
RUN npm i playwright@1.57.0

# Install headless chrome for playwright
RUN npx playwright@1.57.0 install --with-deps --only-shell chromium

# Copy bundled script and sourcemap
COPY ./dist /app
CMD ["node", "/app/index.js"]
