module.exports = {
  apps: [
    {
      name: 'SmartMess-backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Logging
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Performance
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Restart policy
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    },
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/SmartMess-backend.git',
      path: '/var/www/SmartMess-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}; 