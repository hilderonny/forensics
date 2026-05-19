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

# Alles kopieren
COPY . .

# Abhängigkeiten installieren
RUN npm ci

# Anwendungsport freigeben
EXPOSE 8443

# Arrange starten und Forensics einbinden
CMD ["node", "--experimental-sqlite", "./ForensicsServer.mjs"]
