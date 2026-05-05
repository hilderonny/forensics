# forensics

## Verwendung mit Docker

```sh
# Bauen
docker build -t hilderonny2024/forensics .

# Veröffentlichen
docker push hilderonny2024/forensics

# Starten
docker run -d --name forensics -p 8443:8443 -v ./data:/app/data hilderonny2024/forensics
```