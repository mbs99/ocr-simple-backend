FROM debian as builder
RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs
WORKDIR /app
COPY src tsconfig.json tsconfig.build.json package.json nest-cli.json ./
RUN npm i && npm i -g @nestjs/cli && nest build

FROM debian
RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs ocrmypdf img2pdf tesseract-ocr-deu tesseract-ocr-eng
RUN adduser --quiet --disabled-password --shell /bin/bash --home /home/node --gecos "User" node
USER node
WORKDIR /home/node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ADD templates ./templates
ADD assets ./assets
ENTRYPOINT [ "node", "dist/main.js" ]
