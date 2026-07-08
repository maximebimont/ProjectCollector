#!/usr/bin/env bash
# Genere un certificat auto-signe pour le dev local (SAN=localhost).
# A relancer avant le premier `docker compose up` (le dossier certs/ n'est
# jamais commite, voir .gitignore).
set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/certs"
mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "$CERT_DIR/dev.key" \
  -out "$CERT_DIR/dev.crt" \
  -days 825 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificat de dev genere dans $CERT_DIR (valide 825 jours)."
