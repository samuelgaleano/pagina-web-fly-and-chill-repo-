// Configuración de PM2 para producción (AWS EC2).
//
// Uso en el servidor:
//   cd ~/origin
//   git pull
//   npm ci                 # instala dependencias de forma reproducible
//   npm run build          # genera dist/ (build estático del frontend)
//   pm2 start ecosystem.config.cjs   # (o: pm2 reload ecosystem.config.cjs)
//   pm2 save               # persiste el proceso para reinicios del SO
//
// Claves de esta config:
//  - NODE_ENV=production  -> el server sirve dist/ y NO carga Vite/HMR.
//  - max_memory_restart   -> PM2 reinicia el proceso si supera el límite,
//    evitando que el kernel lo mate por OOM en una instancia de 1 GB.
//  - kill_timeout         -> da tiempo al apagado ordenado (graceful) del server.
module.exports = {
  apps: [
    {
      name: "flyandchill",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "server.ts",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      kill_timeout: 12000,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
