const { test, expect } = require('@playwright/test');

test.describe('Módulo de Productos - Integración PI-02', () => {

  test('Validación de categoría inexistente al registrar producto', async ({ page }) => {
    
    // 1. SESIÓN
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'token_auth_uthh_2026');
    });

    // 2. INTERCEPTOR (Simulamos error 400 de Integridad Referencial)
    await page.route('**/api/productos', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            message: "Error de integridad: La categoría ID 999 no existe." 
          })
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      }
    });

    // Mock para categorías iniciales
    await page.route('**/api/categorias', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: 1, nombre: 'Bebidas' }])
      });
    });

    // 3. NAVEGACIÓN
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/gestion_productos.html'); 

    // 4. ACCIÓN: Llenar formulario (Paso 1 y 2 de tu tabla)
    await page.click('#btnMostrarFormularioProductos');
    await page.waitForSelector('#inputNombre');

    await page.fill('#inputNombre', 'Producto Error PI-02');
    await page.fill('#inputDescripcion', 'Validación de llave foránea');
    await page.fill('#inputStock', '10');
    await page.fill('#inputPrecioCompra', '15.00');
    await page.fill('#inputPrecioVenta', '25.00');

    // PASO 3: Inyectar Categoría 999
    await page.locator('#selectCategoria').evaluate((node) => {
        const opt = document.createElement('option');
        opt.value = '999';
        opt.textContent = 'Categoría Inexistente';
        node.appendChild(opt);
        node.value = '999';
    });

    // 5. INTENTAR GUARDAR
    // Usamos force: true para asegurar que el clic se dispare aunque haya capas encima
    await page.click('#formularioProducto button[type="submit"]', { force: true });

    // 6. VERIFICACIÓN (Paso 4 y 5 de tu tabla)
    // En lugar de locator('#id'), buscamos por el texto que genera tu mostrarToast
    const mensajeError = page.locator('text=/No se pudo guardar/i');
    
    // Aumentamos el timeout a 15 segundos para dar tiempo al appendChild
    await expect(mensajeError).toBeVisible({ timeout: 15000 });

    console.log("PI-02 Lograda: El Toast de error fue detectado por texto.");
    
    // Pausa para tu evidencia
    await page.waitForTimeout(5000); 
  });

});