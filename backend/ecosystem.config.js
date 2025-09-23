// backend/ecosystem.config.js
export default {
  apps: [
    {
      name: "redvelvetlive-api",
      script: "./src/server.js",   // entrypoint correcto
      instances: 1,                // "1" para mantenerlo simple, puedes usar "max"
      exec_mode: "fork",           // cluster si quieres usar todos los cores
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3001                 // desarrollo local
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001                 // 🔥 mantén 3001, porque tu Nginx hace proxy_pass a 3001
      }
    }
  ]
}

