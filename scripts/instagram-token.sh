#!/usr/bin/env bash
#
# instagram-token.sh — Convierte un token CORTO de Instagram en uno LARGO
# (long-lived, 60 días) y lo verifica leyendo el feed.
#
# Uso:
#   ./scripts/instagram-token.sh <APP_SECRET> <TOKEN_CORTO>
#
# Dónde sacar los datos (ver guía en DEPLOY.md):
#   APP_SECRET  → developers.facebook.com → tu app → Configuración de la app →
#                 Básica → "Clave secreta de la app" (Instagram App Secret).
#   TOKEN_CORTO → developers.facebook.com → tu app → Instagram → API setup with
#                 Instagram login → "Generate access tokens" → token de la cuenta.
#
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

if [ "$#" -ne 2 ]; then
  echo -e "${RED}Uso: $0 <APP_SECRET> <TOKEN_CORTO>${NC}"
  exit 1
fi

APP_SECRET="$1"
SHORT_TOKEN="$2"

echo -e "${YELLOW}==> Intercambiando token corto por uno de larga duración...${NC}"
RESP="$(curl -s "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${APP_SECRET}&access_token=${SHORT_TOKEN}")"

LONG_TOKEN="$(echo "$RESP" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//;s/"//')"

if [ -z "$LONG_TOKEN" ]; then
  echo -e "${RED}XX No se pudo obtener el token largo. Respuesta de Meta:${NC}"
  echo "$RESP"
  exit 1
fi

echo -e "${GREEN}✔ Token de larga duración obtenido (válido 60 días):${NC}"
echo
echo "$LONG_TOKEN"
echo

echo -e "${YELLOW}==> Verificando que el token lee el feed...${NC}"
FEED="$(curl -s "https://graph.instagram.com/me/media?fields=id,permalink&limit=3&access_token=${LONG_TOKEN}")"
if echo "$FEED" | grep -q '"permalink"'; then
  echo -e "${GREEN}✔ El token funciona: el feed devolvió publicaciones.${NC}"
else
  echo -e "${RED}!! El token se generó pero el feed vino vacío o con error:${NC}"
  echo "$FEED"
fi

echo
echo -e "${GREEN}Siguiente paso:${NC} pon esta línea en el .env de la instancia y corre ./deploy.sh"
echo "INSTAGRAM_ACCESS_TOKEN=\"${LONG_TOKEN}\""
