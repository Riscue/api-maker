FROM node:23-alpine AS appbuild
WORKDIR /opt/api-maker
COPY package.json ./
RUN npm install
COPY ./src ./src
COPY tsconfig.json ./
RUN npm run build

FROM node:23-alpine
WORKDIR /opt/api-maker

COPY package.json ./
RUN npm install --omit=dev
COPY --from=appbuild /opt/api-maker/dist ./

EXPOSE 8080
CMD ["/bin/sh", "-c", "node app.js"]
