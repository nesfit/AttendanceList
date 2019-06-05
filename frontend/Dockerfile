FROM node:8.16.0-jessie

WORKDIR nesatfit/attendance-list-frontend

COPY frontend ./

RUN npm install
RUN npm run build

RUN pwd
RUN ls -al
