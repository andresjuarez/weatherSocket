FROM node:alpine

RUN mkdir -p /var/app/current

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules /var/app/current

WORKDIR /var/app/current
COPY . /var/app/current

ENV NODE_ENV=production

EXPOSE 80 
CMD ["npm", "start"]