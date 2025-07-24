describe('Smoke Test', () => {
  it('should load flavors page and display table', () => {
    cy.visit('/flavors');
    cy.contains('Название');
    cy.get('table').should('exist');
  });
});
