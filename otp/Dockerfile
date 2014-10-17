
FROM java

MAINTAINER Conveyal

RUN wget -O otp.jar https://s3.amazonaws.com/carfreeatoz-staging/otp/otp.jar
RUN wget -O Graph.obj https://s3.amazonaws.com/carfreeatoz-staging/otp/Graph.obj

EXPOSE 8080

CMD [ "java", "-Xmx6G", "-Xverify:none", "-jar", "otp.jar", "--server", "--graphs", "." ]
