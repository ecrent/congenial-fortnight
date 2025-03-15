describe('User Registration', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should navigate from home to registration page', () => {
    // Check if we're on the home page
    cy.contains('Welcome').should('exist');
    
    // Navigate to registration
    cy.contains('Register').click();
    
    // Verify we're on the registration page
    cy.url().should('include', '/register');
    cy.contains('Register').should('be.visible');
  });

  it('should complete the registration process', () => {
    // Set up intercept
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
    
    // Fill out form with unique values
    const uniqueSuffix = Date.now().toString().slice(-6);
    cy.fillRegistrationForm({
      name: `testuser${uniqueSuffix}`,
      email: `test${uniqueSuffix}@example.com`,
      password: 'Password123!'
    });
    
    // Submit the form
    cy.get('button[type="submit"].btn.btn-primary').click();
    cy.wait('@registerRequest');
    
    // Verify successful registration
    cy.url().should('include', '/join');
    cy.contains('Create').should('be.visible');
  });


});
