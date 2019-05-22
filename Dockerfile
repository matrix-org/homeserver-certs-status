FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY homeservers.sql ./

RUN npm install

COPY *.js ./

COPY run.sh .

COPY index-template.html .
RUN apk add sqlite postgresql-client
RUN sqlite3 visible.db < homeservers.sql

CMD [ "/usr/src/app/run.sh" ]
