module.exports = {
  apps: [{
    name: 'free-time-finder',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }],
}