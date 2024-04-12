module.exports = {
    apps : [{
      name: 'amruit-backend',
      script: 'yarn',
      args: 'start:dev',
      interpreter: '/bin/bash', // You may need to adjust this path depending on your system
      env: {
        NODE_ENV: 'development'
      },
      watch: true, // Enable watching for file changes
      ignore_watch: ['node_modules'], // Ignore watching changes in node_modules directory
      watch_delay: 1000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/pm2_error.log',
      out_file: 'logs/pm2_out.log',
      pid_file: 'logs/pm2.pid'
    }]
  };
  