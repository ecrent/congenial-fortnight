describe('Session Management Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('#loginName').type('testuser');
    cy.get('#loginPassword').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/join');
  });
  
  it('should create a new session', () => {
    cy.get('.btn-success').contains('Create New Session').click();
    
    // Should be redirected to schedule input page
    cy.url().should('include', '/schedule');
    
    // Session info should be displayed
    cy.get('.alert-info').should('contain', 'Session Code');
  });
  
  it('should join an existing session', () => {
    // This test assumes there's a valid session code to join
    // In a real test, you might need to create a session first
    const sessionCode = 'TEST1234'; // Replace with a real code or set up a test fixture
    
    cy.get('#sessionCode').type(sessionCode);
    cy.get('.btn-primary').contains('Join Session').click();
    
    // Should be redirected to schedule input
    cy.url().should('include', '/schedule');
  });
  
  it('should navigate back from schedule to join', () => {
    // First create a session
    cy.get('.btn-success').contains('Create New Session').click();
    cy.url().should('include', '/schedule');
    
    // Now click the back button
    cy.get('.btn-outline-secondary').contains('Back to Join').click();
    
    // Should be back at join page
    cy.url().should('include', '/join');
  });
});
