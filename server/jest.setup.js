// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Note: We should NOT define Jest functions like afterAll here
// Jest globals need to be used within test files or in setupFilesAfterEnv
