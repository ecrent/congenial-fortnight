const { execSync } = require('child_process');

try {
  console.log('Installing Xvfb dependency...');
  execSync('apt-get update && apt-get install -y xvfb', { stdio: 'inherit' });
  console.log('Xvfb installed successfully.');
  
  console.log('Running E2E tests...');
  execSync('xvfb-run --auto-servernum --server-args=\'-screen 0 1280x720x24\' npm run test:e2e', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during setup or test execution:', error);
  process.exit(1);
}
