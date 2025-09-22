// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'redvelvetlive-backend',
      script: './src/server.js',              // entrypoint correcto
      node_args: '--enable-source-maps',      // útil en Node 18+
      instances: 'max',                       // aprovecha todos los núcleos
      exec_mode: 'cluster',                   // balance de carga
      watch: false,                           // true en dev, false en prod
      out_file: './logs/out.log',             // logs estándar
      error_file: './logs/error.log',         // logs de errores
      merge_logs: true,
      max_restarts: 10,
      min_uptime: 5000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: '.env.production' // fuerza leer .env.production
      }
    }
  ]
};
