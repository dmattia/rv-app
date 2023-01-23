# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=14-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN chsh -s /bin/zsh
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && sudo ./aws/install \
    && rm -rf awscliv2.zip ./aws
RUN curl -fsSL https://get.pulumi.com | sh -s -- --version 3.38.0 \
  && /root/.pulumi/bin/pulumi plugin install resource aws-native v0.12.0 \
  && NEW_PATH="$PATH:/root/.pulumi/bin" \
  && echo "export PATH=$NEW_PATH" >> "/root/.zshrc"
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.zsh_history" \
    && echo $SNIPPET >> "/root/.zshrc"
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
      python3.9 \
      moreutils \
      software-properties-common \
      tree \
      zsh-autosuggestions
RUN apt-get install -y python3-pip \
  && pip install --upgrade pip \
  && pip install pre-commit
