FROM node:14.15.4-buster-slim as builder

ENV CI=true
ENV GENERATE_SOURCEMAP=false

WORKDIR /app

COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig.json ./tsconfig.json
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./nginx.conf ./nginx.conf
COPY ./start.sh ./start.sh

RUN npm ci
RUN npm run build

FROM nginx:1.18-alpine

# Add Tini
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

RUN apk add --no-cache bash

COPY --from=builder /app/build/ /usr/share/nginx/html/
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80