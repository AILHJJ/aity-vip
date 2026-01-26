module.exports = {
  apps: [
    {
      name: 'private-sharing-app-backend',
      script: './src/index.js',
      cwd: '/root/private-sharing-app/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3001
      },
      error_file: '/root/private-sharing-app/logs/pm2-error.log',
      out_file: '/root/private-sharing-app/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
