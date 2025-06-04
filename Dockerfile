FROM alpine:latest

WORKDIR /app
COPY renamer .
COPY config/config.yml ./config/
COPY dist ./dist

VOLUME /home

EXPOSE 7777
ENTRYPOINT [ "./renamer" ]