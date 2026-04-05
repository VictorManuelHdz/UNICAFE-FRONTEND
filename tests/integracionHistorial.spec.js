const { test, expect } = require('@playwright/test');

test.describe('Módulo de Pedidos - Integración PI-10', () => {

    test('Detección de inconsistencia en ID de Pedido modificado', async ({ page }) => {
        // 1. Configurar los interceptores ANTES de navegar
        // Esto garantiza que Playwright esté listo para capturar la petición desde el segundo 0
        await page.route('**/api/pedidos/usuario/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ 
                    idPedido: 505, 
                    fecha: "2026-03-28T18:00:00", 
                    total: 150.00, 
                    estado: 'Pendiente' 
                }])
            });
        });

        await page.route('**/api/pedidos/505', async route => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ success: false, message: "Inconsistencia detectada" })
            });
        });

        // 2. Ir al login para establecer el origen/dominio
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/login.html');

        // 3. Inyectar sesión
        await page.evaluate(() => {
            localStorage.setItem('token', 'token_auth_uthh_2026');
            const usuarioSimulado = {
                id: 123,
                nombre: "Estudiante UTHH",
                correo: "test@uthh.edu.mx"
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioSimulado));
        });

        // 4. Navegar a la página de pedidos
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/mis_pedidos.html');

        // 5. Verificación del botón con un selector más flexible para evitar fallos por espacios o emojis
        const btnVer = page.locator('button').filter({ hasText: 'Ver detalle' }).first();
        
        // Esperar a que el JS de tu página renderice la tabla
        await expect(btnVer).toBeVisible({ timeout: 15000 });
        
        // Usar dispatchEvent en lugar de click si el botón está tapado por algún overlay de carga
        await btnVer.dispatchEvent('click');

        // 6. Verificación del Toast
        // Como en el caso anterior, buscamos el contenedor que definiste en tu proyecto
        const toast = page.locator('#toast-container');
        await expect(toast).toBeVisible({ timeout: 10000 });
        
        // Usamos una expresión regular para que sea flexible ("No se pudo cargar" o "Inconsistencia")
       // Primero localizamos el texto dentro del toast y luego verificamos visibilidad
        await expect(toast.filter({ hasText: /No se pudo cargar|Inconsistencia/i })).toBeVisible();

        console.log("✅ PI-10: Prueba de inconsistencia validada correctamente en todos los motores.");
    });
});