const { test, expect } = require('@playwright/test');

test.describe('PA-01: Validación de Reglas de Negocio - Administrador', () => {

    test('Debe bloquear el registro si el precio de venta es menor al de compra', async ({ page }) => {
        // 1. Simular Login de Administrador (Inyectar Token y Datos)
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/gestion_productos.html');
        
        await page.evaluate(() => {
            const usuarioAdmin = {
                nombre: "Administrador Test",
                rol: "admin",
                token: "TOKEN_DE_PRUEBA_O_REAL" // Playwright usará esto para las peticiones
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioAdmin));
            localStorage.setItem('token', 'TU_TOKEN_AQUÍ'); 
        });

        // 2. Recargar para que el sistema reconozca la sesión
        await page.reload();

        // 3. Abrir el formulario de productos
        await page.click('#btnMostrarFormularioProductos');

        // 4. Rellenar datos de prueba (Escenario de ERROR de negocio)
        await page.fill('#inputNombre', 'Café de Especialidad TEST');
        await page.fill('#inputDescripcion', 'Prueba de validación PA-01');
        await page.selectOption('#selectCategoria', { index: 1 });
        await page.fill('#inputStock', '5');
        
        // --- VALORES PARA PROVOCAR EL FALLO ---
        await page.fill('#inputPrecioCompra', '50.00'); // Compra cara
        await page.fill('#inputPrecioVenta', '20.00');  // Venta barata (Pérdida)
        
        await page.selectOption('#selectProveedor', { index: 1 });

        // 5. Intentar guardar
        await page.click('button[type="submit"]');

        // 6. VERIFICACIÓN TÉCNICA
        // Si el sistema es correcto, debe salir el Toast de error y NO debe haber petición POST exitosa
        const toastError = page.locator('#toast-notification');
        
        // Esperamos que el sistema DETENGA el proceso
        await expect(toastError).toBeVisible({ timeout: 5000 });
        await expect(toastError).toContainText('no puede ser menor');

        console.log('✅ Prueba PA-01 finalizada: Verificando si el sistema protegió la inversión.');
    });
});