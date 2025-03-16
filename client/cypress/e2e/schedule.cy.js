describe('Schedule Input', () => {
  beforeEach(() => {
    // Login and create a session before each test
    cy.visit('/login');
    cy.get('#loginName').type('testuser');
    cy.get('#loginPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Create a new session
    cy.get('.btn-success').contains('Create New Session').click();
  });
  
  it('should add availability', () => {
    // Select day and time
    cy.get('#day_of_week').select('Monday');
    cy.get('#start_time').type('09:00');
    cy.get('#end_time').type('17:00');
    
    // Add availability
    cy.get('button').contains('Add Availability').click();
    
    // Check if availability was added to the table
    cy.get('table tbody').should('contain', 'Monday');
    cy.get('table tbody').should('contain', '9:00 AM');
    cy.get('table tbody').should('contain', '5:00 PM');
  });
  
  it('should mark user as ready', () => {
    // Add availability first
    cy.get('#day_of_week').select('Monday');
    cy.get('#start_time').type('09:00');
    cy.get('#end_time').type('17:00');
    cy.get('button').contains('Add Availability').click();
    
    // Mark as ready
    cy.get('button').contains("I'm Done Adding My Availability").click();
    
    // Button should change
    cy.get('button').contains("I'm Not Ready Yet - Make Changes");
    
    // If all users are ready, it should redirect to results
    // This may not happen in test environment if there are multiple users
  });
  
  it('should delete availability', () => {
    // Add availability first
    cy.get('#day_of_week').select('Monday');
    cy.get('#start_time').type('09:00');
    cy.get('#end_time').type('17:00');
    cy.get('button').contains('Add Availability').click();
    
    // Check that it was added
    cy.get('table tbody tr').should('have.length', 1);
    
    // Delete it
    cy.get('button').contains('Remove').click();
    
    // Check that it was removed
    cy.get('table tbody tr').should('have.length', 0);
  });
});
