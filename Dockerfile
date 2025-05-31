FROM alpine:latest

WORKDIR /app
COPY renamer .
COPY config ./config
EXPOSE 7777
ENTRYPOINT [ "./renamer" ]