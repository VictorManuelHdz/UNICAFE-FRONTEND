const { test, expect } = require('@playwright/test');

test.describe('Módulo de Productos - Integración PI-06', () => {

  test('Validación de consistencia con proveedor inexistente', async ({ page }) => {
    
    // 1. SESIÓN
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/');
    await page.evaluate(() => localStorage.setItem('token', 'token_auth_uthh_2026'));

    // 2. INTERCEPTOR (Caja Gris)
    await page.route('**/api/productos', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            message: "Error de consistencia: El proveedor ID 888 no existe." 
          })
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      }
    });

    // Mock de categorías
    await page.route('**/api/categorias', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, nombre: 'Bebidas' }]) });
    });

    // 3. NAVEGACIÓN
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/gestion_productos.html'); 

    // 4. ACCIÓN
    await page.click('#btnMostrarFormularioProductos');
    await page.waitForSelector('#inputNombre', { state: 'visible' });

    await page.fill('#inputNombre', 'Producto PI-06');
    await page.fill('#inputDescripcion', 'Prueba de consistencia externa');
    await page.fill('#inputStock', '10');
    await page.fill('#inputPrecioCompra', '10');
    await page.fill('#inputPrecioVenta', '20');

    // INYECCIÓN MANUAL (Asegurando que el DOM lo reconozca)
    await page.evaluate(() => {
        const sel = document.querySelector('#selectCategoria');
        const opt = document.createElement('option');
        opt.value = '888';
        opt.textContent = 'Proveedor 888 (Inexistente)';
        sel.appendChild(opt);
        sel.value = '888';
        // Disparamos el evento de cambio por si tu JS lo necesita
        sel.dispatchEvent(new Event('change'));
    });

    // 5. CLICK FORZADO
    // Esperamos un poco para que el DOM procese la inyección
    await page.waitForTimeout(500);
    const btnSubmit = page.locator('#formularioProducto button[type="submit"]');
    await btnSubmit.click({ force: true });

    // 6. VERIFICACIÓN POR TEXTO (Más flexible)
    // Buscamos cualquier elemento que aparezca con el mensaje de error
    const toast = page.locator('div:has-text("No se pudo"), .toast, #toast-notification').first();
    
    await expect(toast).toBeVisible({ timeout: 20000 });

    console.log("PI-06 Lograda: El sistema rechazó el proveedor inexistente.");
    await page.waitForTimeout(5000); 
  });
});