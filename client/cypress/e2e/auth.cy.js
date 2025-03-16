describe('Authentication', () => {
  beforeEach(() => {
    // Clear session storage before each test
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should allow a user to register', () => {
    const username = `testuser_${Date.now()}`;
    
    cy.visit('/register');
    cy.get('#userName').type(username);
    cy.get('#userEmail').type(`${username}@example.com`);
    cy.get('#userPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // After registration, should be redirected to join page
    cy.url().should('include', '/join');
  });
  
  it('should allow a user to login', () => {
    // This assumes you have a test user already in the system or you've created one
    cy.visit('/login');
    cy.get('#loginName').type('testuser');
    cy.get('#loginPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // After login, should be redirected to join page
    cy.url().should('include', '/join');
  });
  
  it('should show validation errors for invalid inputs', () => {
    cy.visit('/register');
    
    // Try submitting with empty fields
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.get('.invalid-feedback').should('be.visible');
    
    // Try with invalid email
    cy.get('#userName').type('testuser');
    cy.get('#userEmail').type('invalidemail');
    cy.get('#userPassword').type('pass');
    
    // Should show validation for email and password
    cy.get('.invalid-feedback').should('be.visible');
  });
  
  it('should redirect to homepage on logout', () => {
    // Login first
    cy.visit('/login');
    cy.get('#loginName').type('testuser');
    cy.get('#loginPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Now logout
    cy.get('button.btn-secondary').contains('Logout').click();
    
    // Should be redirected to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
