FROM rust:1.95-bookworm

WORKDIR /app

COPY server/Cargo.toml ./Cargo.toml
COPY server/src ./src
COPY server/templates ./templates
COPY server/content ./content
COPY server/static ./static
COPY data/problems.sqlite ./data/problems.sqlite

RUN cargo build --release

ENV BIND_ADDRESS=0.0.0.0:8080 \
    DATABASE_PATH=/app/data/problems.sqlite \
    STATIC_DIRECTORY=/app/static

EXPOSE 8080

CMD ["./target/release/teachyourselfmath"]
