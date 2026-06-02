#!/usr/bin/env bash
#
# deploy.sh — Redespliegue de Fly and Chill en la instancia EC2.
#
# Uso (en la instancia, dentro de ~/origin):
#     ./deploy.sh
#
# Encadena: git pull -> npm ci -> build -> PM2 reload -> verificación.
# Pensado para Amazon Linux 2023 (t3.micro). Requiere haber corrido antes,
# UNA sola vez, ./scripts/setup-swap.sh (para que el build no muera por OOM).
#
# IMPORTANTE: todo el script va dentro de una función main() que se invoca al
# final. Así bash carga el archivo COMPLETO en memoria antes de ejecutar, y un
# `git pull` que actualice este mismo deploy.sh a mitad de ejecución NO puede
# corromper la lógica (problema clásico de scripts que se auto-actualizan).
#
set -euo pipefail

main() {
  cd "$(dirname "$0")"

  local GREEN='\033[0;32m' YELLOW='\033[1;33m' RED='\033[0;31m' NC='\033[0m'
  step() { echo -e "\n${GREEN}==> $1${NC}"; }
  warn() { echo -e "${YELLOW}!! $1${NC}"; }
  fail() { echo -e "${RED}XX $1${NC}"; exit 1; }

  # 0) Aviso si no hay swap (riesgo de OOM al compilar en 1 GB de RAM).
  if [ "$(swapon --show | wc -l)" -eq 0 ]; then
    warn "No hay swap activa. En t3.micro el build puede morir por falta de RAM."
    warn "Ejecuta una sola vez: ./scripts/setup-swap.sh"
  fi

  # 1) Traer el último código de la rama actual.
  step "git pull"
  git pull --ff-only

  # 2) Dependencias reproducibles (usa package-lock.json).
  step "npm ci"
  npm ci

  # 3) Compilar el frontend (genera dist/).
  step "npm run build"
  npm run build
  [ -f dist/index.html ] || fail "El build no generó dist/index.html. Aborto."

  # 4) (Re)arrancar con PM2 en modo producción.
  #    'reload' hace recarga sin downtime si ya existe; si no, 'start'.
  step "PM2 reload"
  if pm2 describe flyandchill >/dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save

  # 5) Verificación post-despliegue.
  step "Verificación"
  local PORT="${PORT:-3000}"
  # En t3.micro tsx puede tardar varios segundos en arrancar. Reintentamos
  # hasta ~40s antes de declarar el fallo, para no dar un falso negativo.
  local OK=0 i
  for i in $(seq 1 20); do
    if curl -fs "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
      OK=1
      local health
      health="$(curl -fs "http://localhost:${PORT}/api/health" 2>/dev/null || true)"
      echo -e "${GREEN}   /api/health OK (intento $i)${NC}"
      echo -e "${GREEN}   $health${NC}"
      case "$health" in
        *'"firestore":"admin"'*)  echo -e "${GREEN}   Firestore en modo ADMIN (cuenta de servicio) ✔${NC}" ;;
        *'"firestore":"client"'*) warn "Firestore en modo CLIENTE: el webhook NO podrá actualizar pedidos. ¿Falta service-account.json?" ;;
      esac
      break
    fi
    sleep 2
  done
  if [ "$OK" -ne 1 ]; then
    echo -e "${RED}   La API no respondió tras ~40s. Revisa: pm2 logs flyandchill --lines 40${NC}"
    fail "Verificación de /api/health fallida"
  fi

  # 6) Aviso si quedó el puerto de desarrollo (no debería en producción).
  if ss -tlnp 2>/dev/null | grep -q ':24678'; then
    warn "Puerto 24678 (HMR de Vite) abierto: el server NO está en modo producción."
    warn "Revisa que ecosystem.config.cjs tenga NODE_ENV=production."
  else
    echo -e "${GREEN}   Sin HMR (modo producción correcto)${NC}"
  fi

  echo -e "\n${GREEN}✔ Despliegue completado.${NC} Logs: pm2 logs flyandchill --lines 30"
}

main "$@"
