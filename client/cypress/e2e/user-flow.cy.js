describe('Basic User Flow', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should navigate from home to registration page', () => {
    // Check if we're on the home page using more generic selectors
    cy.contains('Welcome').should('exist');
    
    // Find and click registration link or button - trying different selectors
    cy.contains('Register').click();
    
    // Verify we're on the registration page
    cy.url().should('include', '/register');
    // Look for registration form or heading
    cy.contains('Register').should('be.visible');
  });

  it('should complete the registration process', () => {
    // Set up intercept before visiting the page
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { 
            name: 'testuser', 
            email: 'test@example.com',
            role: 'user'
          },
          accessToken: 'fake-token',
          refreshToken: 'fake-refresh-token'
        }
      }
    }).as('registerRequest');
    
    // Navigate to registration page
    cy.visit('/register');
    
    // Fill out registration form with unique values
    const uniqueSuffix = Date.now().toString().slice(-6);
    cy.fillRegistrationForm({
      name: `testuser${uniqueSuffix}`,
      email: `test${uniqueSuffix}@example.com`,
      password: 'Password123!'
    });
    
    // Submit the form
    cy.get('button[type="submit"].btn.btn-primary').click();
    
    // Wait for the intercepted request
    cy.wait('@registerRequest');
    
    // Verify successful registration (redirect to join page)
    cy.url().should('include', '/join');
    cy.contains('Create').should('be.visible');
  });

  it('should allow user to login and access join page', () => {
    const name = `user${Date.now().toString().slice(-6)}`;
    const email = `test${Date.now().toString().slice(-6)}@example.com`;
    const password = 'Password123!';
    
    // Set up intercepts for registration and login
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { name: name, email: email, role: 'user' },
          accessToken: 'fake-token',
          refreshToken: 'fake-refresh-token'
        }
      }
    }).as('registerRequest');
    
    cy.intercept('POST', '**/api/v1/users/login', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { name: name, email: email, role: 'user' },
          accessToken: 'fake-login-token',
          refreshToken: 'fake-login-refresh-token'
        }
      }
    }).as('loginRequest');
    
    // Register a new user
    cy.visit('/register');
    cy.fillRegistrationForm({
      name: name,
      email: email,
      password: password
    });
    cy.get('button[type="submit"].btn.btn-primary').click();
    cy.wait('@registerRequest');
    
    // Log out
    cy.contains('Logout').click();
    
    // Login with the new user
    cy.login(name, password);
    cy.wait('@loginRequest');
    
    // Verify login success
    cy.url().should('include', '/join');
    cy.contains('Create').should('be.visible');
  });
});
