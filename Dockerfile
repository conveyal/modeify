FROM node:latest
ADD . /code
WORKDIR /code
RUN rm -rf node_modules
RUN npm install

