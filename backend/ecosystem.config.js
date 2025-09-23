export default {
  apps: [
    {
      name: 'redvelvetlive-api',
      script: './src/server.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
