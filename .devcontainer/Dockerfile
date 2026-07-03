FROM ubuntu:26.04

SHELL ["/bin/bash", "-c"]

ENV DEBIAN_FRONTEND=noninteractive

# --------------------------------------------------
# Basis-Pakete
# --------------------------------------------------

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    zip \
    sudo \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    build-essential \
    openssh-client \
    zsh \
    fzf \
    python3 \
    python3-pip \
    python3-venv \
    locales \
    tzdata \
    nano \
    vim \
    less \
    jq \
    tar \
    gzip \
    xz-utils \
    docker.io \
    docker-compose-v2 \
    docker-buildx \
    tesseract-ocr \
    tesseract-ocr-deu \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------------------------
# Deutsche Locale
# --------------------------------------------------

RUN locale-gen de_DE.UTF-8

ENV LANG=de_DE.UTF-8
ENV LANGUAGE=de_DE:de
ENV LC_ALL=de_DE.UTF-8
ENV TZ=Europe/Berlin

# --------------------------------------------------
# Tools
# --------------------------------------------------

ARG TASK_VERSION=v3.42.1

RUN curl -fsSL https://taskfile.dev/install.sh | sh -s -- -d -b /usr/local/bin "$TASK_VERSION"

# --------------------------------------------------
# Ubuntu User vorbereiten
# --------------------------------------------------

RUN usermod -s /usr/bin/zsh ubuntu && \
    usermod -aG docker ubuntu && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER ubuntu
WORKDIR /home/ubuntu

# --------------------------------------------------
# Oh My Zsh
# --------------------------------------------------

RUN RUNZSH=no CHSH=no sh -c \
    "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"



#---------------------------------------------------
# Set Java & Node Version
#---------------------------------------------------
ARG JAVA_VERSION=21-tem
ARG NODE_VERSION=lts/*
# --------------------------------------------------
# SDKMAN
# --------------------------------------------------

ENV SDKMAN_DIR="/home/ubuntu/.sdkman"

RUN curl -s "https://get.sdkman.io" | bash

RUN source "$SDKMAN_DIR/bin/sdkman-init.sh" && \
    sdk install java "$JAVA_VERSION" && \
    sdk install gradle

# --------------------------------------------------
# NVM + Node.js LTS
# --------------------------------------------------

ENV NVM_DIR="/home/ubuntu/.nvm"

RUN mkdir -p "$NVM_DIR"

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

RUN source "$NVM_DIR/nvm.sh" && \
    nvm install "$NODE_VERSION" && \
    nvm alias default "$NODE_VERSION" && \
    nvm use default


# --------------------------------------------------
# ZSH Konfiguration
# --------------------------------------------------

RUN echo '' >> ~/.zshrc && \
    echo '# SDKMAN' >> ~/.zshrc && \
    echo 'export SDKMAN_DIR="$HOME/.sdkman"' >> ~/.zshrc && \
    echo '[[ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]] && source "$SDKMAN_DIR/bin/sdkman-init.sh"' >> ~/.zshrc

RUN echo '' >> ~/.zshrc && \
    echo '# NVM' >> ~/.zshrc && \
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"' >> ~/.zshrc


# RUN npm install -g opencode-cli   
# --------------------------------------------------
# Standard Shell
# --------------------------------------------------

CMD ["/usr/bin/zsh"]
