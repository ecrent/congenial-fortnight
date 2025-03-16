describe('Admin Functionality', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('#loginName').type('admin');
    cy.get('#loginPassword').type('adminpassword');
    cy.get('button[type="submit"]').click();
    
    // Should be redirected to admin dashboard
    cy.url().should('include', '/admin');
  });
  
  it('should display admin dashboard', () => {
    cy.get('.card-header').should('contain', 'Admin Dashboard');
    cy.get('.card-title').should('contain', 'Welcome');
    
    // Stats should be visible
    cy.get('.display-4').should('have.length', 3); // Users, Sessions, Schedules
  });
  
  it('should navigate to user management', () => {
    cy.get('button').contains('Manage Users').click();
    cy.url().should('include', '/admin/users');
    
    // User table should be visible
    cy.get('table').should('be.visible');
    cy.get('th').should('contain', 'Name');
  });
  
  it('should navigate to session management', () => {
    cy.get('button').contains('View Sessions').click();
    cy.url().should('include', '/admin/sessions');
    
    // Session table should be visible
    cy.get('table').should('be.visible');
    cy.get('th').should('contain', 'Session Code');
  });
  
  it('should navigate to schedule management', () => {
    cy.get('button').contains('Manage Schedules').click();
    cy.url().should('include', '/admin/schedules');
    
    // Filters should be visible
    cy.get('#sessionFilter').should('be.visible');
    cy.get('#userFilter').should('be.visible');
  });
  
  it('should edit a user', () => {
    cy.get('button').contains('Manage Users').click();
    
    // Click edit on the first user
    cy.get('button').contains('Edit').first().click();
    cy.url().should('include', '/admin/users/');
    
    // Should see the edit form
    cy.get('#name').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#role').should('be.visible');
    
    // Make a change
    cy.get('#email').clear().type('newemail@example.com');
    cy.get('button').contains('Update User').click();
    
    // Should see success message
    cy.get('.alert-success').should('be.visible');
  });
});
