#!/usr/bin/env bash
#
# setup-swap.sh — Crea 2 GB de swap en la instancia EC2 (ejecutar UNA sola vez).
#
# Por qué: la instancia t3.micro tiene 1 GB de RAM y 0 swap. El build del
# frontend (esbuild + rollup, ~2.100 módulos) puede agotar la RAM y ser abortado
# por el kernel (OOM), dejando el despliegue a medias. 2 GB de swap lo evitan.
#
# Uso (en la instancia):
#     ./scripts/setup-swap.sh
#
set -euo pipefail

if swapon --show | grep -q '/swapfile'; then
  echo "Swap ya configurada:"
  swapon --show
  free -h
  exit 0
fi

echo "Creando /swapfile de 2 GB..."
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Persistir tras reinicios del SO (si no está ya en fstab).
if ! grep -q '/swapfile' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "Listo. Estado de la memoria:"
free -h
