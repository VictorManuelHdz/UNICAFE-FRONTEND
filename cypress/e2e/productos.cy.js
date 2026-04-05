describe('PU-04: Manejo de ruta de imagen inexistente', () => {
    
    it('Debe reemplazar la imagen rota por un div con la inicial del producto', () => {
        cy.viewport(1280, 720); 

        // 1. MOCK DE CATEGORÍAS: Le mentimos al navegador para que no salga a internet
        // Esto evita el bloqueo del antivirus y el error de CORS
        cy.intercept('GET', '**/api/categorias*', {
            statusCode: 200,
            body: [
                { id: 1, nombre: 'Bebidas' },
                { id: 2, nombre: 'Postres' }
            ]
        }).as('cargarCategorias');

        // 2. MOCK DE PRODUCTOS: Mandamos nuestro producto con la imagen rota
        cy.intercept('GET', '**/api/productos*', {
            statusCode: 200,
            body: [{
                id: 999,
                nombre: 'Torta de Jamón',
                descripcion: 'Deliciosa torta de prueba',
                precioVenta: 35.00,
                imagen: 'https://ruta-falsa.com/imagen-que-no-existe.jpg'
            }]
        }).as('cargarProductos');

        // 3. Visitamos tu página (usando la ruta que mostraste en tu captura anterior)
        cy.visit('http://127.0.0.1:5500/public/productos.html'); 
        
        // 4. Esperamos a que Cypress inyecte ambos datos falsos
        cy.wait(['@cargarCategorias', '@cargarProductos']);

        // 5. Verificación visual (Caja Gris)
        cy.get('#contenedor-productos').within(() => {
            cy.get('img').should('not.exist');
            cy.get('div.text-unicafe-avatar-text')
              .should('be.visible')
              .and('contain.text', 'T');
        });
    });
});