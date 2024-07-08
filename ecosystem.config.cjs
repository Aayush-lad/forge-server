module.exports = {
    apps: [{
      name: 'my-app', // The name of the application.
      script: './index.js', // The entry point of your application, the file that starts your server.
      instances: 'max', // This tells PM2 to run as many instances of your application as there are CPU cores available on the machine. This allows the application to utilize all available CPU cores for better performance.
      exec_mode: 'cluster', // This specifies that the application should be run in cluster mode. In cluster mode, PM2 will create a master process and several worker processes (one for each CPU core). This helps in load balancing and handling multiple requests concurrently.
      env: {
        NODE_ENV: 'production', // This sets the environment variable NODE_ENV to 'production'. You can add other environment variables here as well.
        PORT: 5000 // This sets the PORT environment variable to 5000. Your application will use this port to listen for incoming requests.
      }
    }]
  };
  