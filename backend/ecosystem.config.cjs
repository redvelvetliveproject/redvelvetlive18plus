// backend/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "redvelvetlive-api",
      script: "./src/server.js", // Punto de arranque real
      instances: 1,              // "max" si quieres usar todos los núcleos del VPS
      exec_mode: "fork",         // ⚡ Fork: más estable para logs y debugging
      watch: false,              // No observar archivos en producción
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      // 📜 Logs
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // 🔁 Tolerancia ante fallos
      max_restarts: 10,
      min_uptime: 5000,
      kill_timeout: 5000
    }
  ]
};
