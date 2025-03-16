// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
// Add more environment variables as needed

// Note: We should NOT define Jest functions like afterAll here
// Jest globals need to be used within test files or in setupFilesAfterEnv
