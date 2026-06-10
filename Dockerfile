FROM node:22

RUN apt-get update && \
    apt-get install -y \
    openssh-client \
    curl \
    git && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

RUN curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

WORKDIR /workspace

CMD ["/bin/bash"]
