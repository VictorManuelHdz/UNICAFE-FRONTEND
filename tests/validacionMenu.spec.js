const { test, expect } = require('@playwright/test');

test.describe('Módulo de Menú - Pruebas Unitarias', () => {

  test('PU-05: Validación de lista vacía en Menú', async ({ page }) => {
    
    // 1. INTERCEPTOR (IMPORTANTE)
    await page.route('https://unicafe-api.vercel.app/api/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    // 2. NAVEGACIÓN A GITHUB PAGES
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/menu.html'); 

    //mensaje del platillo vacío
    const mensajeVacio = page.getByText(/Actualmente no hay platillos disponibles/i);

    // 4. VERIFICACIÓN DE VISIBILIDAD
    await expect(mensajeVacio).toBeVisible({ timeout: 10000 });

    // Verificamos que el mensaje esté centrado como pide tu reporte
    await expect(mensajeVacio).toHaveCSS('text-align', 'center');
  });

});