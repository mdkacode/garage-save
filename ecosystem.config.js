module.exports = {
    apps : [{
      name: 'amruit-backend',
      script: 'npm',
      args: 'start:dev',
      env: {
        NODE_ENV: 'production'
      },
      watch: false, // Enable watching for file changes
      ignore_watch: ['node_modules'], // Ignore watching changes in node_modules directory
      watch_delay: 1000
    }]
  };
  