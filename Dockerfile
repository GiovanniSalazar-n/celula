FROM node:22

RUN apt-get update && \
    apt-get install -y \
    build-essential \
    ca-certificates \
    openssh-client \
    curl \
    git \
    libssl-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --profile minimal --default-toolchain stable && \
    rustup target add wasm32-unknown-unknown && \
    cargo install wasm-pack --version 0.15.0

RUN curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

WORKDIR /workspace

CMD ["/bin/bash"]
