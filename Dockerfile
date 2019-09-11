FROM bitnami/node

EXPOSE 80
COPY . /app

WORKDIR /app/server
RUN [ "bash", "-c", "npm install" ]

CMD [ "bash", "-c", "npm start" ]
