# Specify node22 arm64 to prevent compatibility issues
FROM public.ecr.aws/lambda/nodejs:22-arm64

# Install binary dependencies
RUN npx @puppeteer/browsers install chrome-headless-shell@stable

# Move external binaries to linux /opt folder
RUN mkdir -p /opt/bin &&\ 
    mv ./chrome-headless-shell/*/*/chrome-headless-shell /opt/bin/chrome-headless-shell

# Permission to run headless chrome
RUN chmod +x /opt/bin/chrome-headless-shell

# Copy built script
COPY ./package.json ./package.json
COPY ./dist ./dist

CMD [ "dist/index.handler" ]
