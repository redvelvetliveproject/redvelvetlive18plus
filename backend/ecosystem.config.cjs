module.exports = {
  apps: [
    {
      name: "redvelvetlive-api",
      script: "./src/server.js",   // o "./src/app.js" si ahí arranca tu API
      instances: 1,                // cámbialo a "max" para usar todos los núcleos
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      max_restarts: 10,
      min_uptime: 5000,
      kill_timeout: 5000
    }
  ]
};
