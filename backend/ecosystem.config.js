export default {
  apps: [
    {
      name: "redvelvetlive-api",
      script: "src/server.js",
      instances: "1",         // Puedes poner "max" para usar todos los cores
      exec_mode: "fork",      // fork = un proceso, cluster = varios
      watch: false,
      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
  ],
};
