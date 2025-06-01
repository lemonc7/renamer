FROM alpine:latest

WORKDIR /app
COPY renamer .
COPY config/config.yml ./config/
EXPOSE 7777
ENTRYPOINT [ "./renamer" ]