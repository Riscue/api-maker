FROM node:16 AS appbuild
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY ./src ./src
COPY tsconfig.json ./
RUN npm run build

FROM node:16
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=appbuild /usr/src/app/dist ./
EXPOSE 8080
CMD ["/bin/sh", "-c", "node app.js"]
