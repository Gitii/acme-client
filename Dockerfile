FROM node:14 as builder

COPY . /build
WORKDIR /build

RUN yarn install --production
RUN yarn add -W typescript@4
RUN yarn build:production
RUN chmod +x packages/acme-client-bot/bin/run.sh
RUN chmod +x run.sh
RUN mkdir -p /app/node_modules /app/packages \
 && cp -R /build/node_modules/* /app/node_modules \
 && cp -R /build/packages/* /app/packages \
 && cp /build/run.sh /app

FROM mhart/alpine-node:slim-14
WORKDIR /app
COPY --from=builder /app /app/

ENTRYPOINT /app/run.sh
