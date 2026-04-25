FROM node:24-slim AS frontend-builder
WORKDIR /app
RUN corepack enable pnpm
# 安装依赖，缓存优化
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# 编译
COPY ./frontend .
RUN pnpm run build


FROM rust:1.95-slim AS backend-builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {println!(\"dummy\")}" > src/main.rs && \
    cargo build --release
RUN rm -f target/release/deps/renamer*

COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=backend-builder /app/target/release/renamer /app/renamer
COPY --from=frontend-builder /app/dist /app/dist
EXPOSE 8080
CMD ["/app/renamer"]