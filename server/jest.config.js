module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setupAfterEnv.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true
};
