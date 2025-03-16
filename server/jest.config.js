module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000, // Increase timeout for CI environment
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setupAfterEnv.js'],
  testPathIgnorePatterns: ['/node_modules/']
};
