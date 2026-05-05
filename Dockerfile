# ─── Basis-Image ────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Systemabhängigkeiten

RUN apt update && \
    apt install -y --no-install-recommends git && \
    apt install -y --reinstall ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Arrange holen
RUN git clone https://github.com/hilderonny/arrange.git ./ && npm install

# HTML kopieren
COPY . ./html

# Anwendungsport freigeben
EXPOSE 8443

# Arrange starten und Forensics einbinden
CMD ["node", "./server.mjs", "--port", "8443", "--datapath", "./data", "--crtfile", "./server.crt", "--keyfile", "./server.key", "--tokensecret", "hubbelebubbele", "--htmlpath", "/=./html"]
