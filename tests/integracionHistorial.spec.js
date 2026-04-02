const { test, expect } = require('@playwright/test');

test.describe('Módulo de Pedidos - Integración PI-10', () => {

    test('Detección de inconsistencia en ID de Pedido modificado', async ({ page }) => {
        // 1. Ir al login para establecer el dominio correcto (UTHH)
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/login.html');

        // 2. INYECCIÓN DOBLE: Token + Objeto Usuario (Esto evita la redirección de tu JS)
        await page.evaluate(() => {
            // Token para las cabeceras de autorización
            localStorage.setItem('token', 'token_auth_uthh_2026');
            
            // Objeto usuario que requiere tu función cargarMisPedidos()
            const usuarioSimulado = {
                id: 123,
                nombre: "Estudiante UTHH",
                correo: "test@uthh.edu.mx"
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioSimulado));
        });

        // 3. INTERCEPTORES DE API: Simulamos los datos y el error 404 de inconsistencia
        // Interceptamos la carga inicial de pedidos del usuario
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

        // Interceptamos el detalle del pedido 505 para que devuelva ERROR
        await page.route('**/api/pedidos/505', async route => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ success: false, message: "Inconsistencia detectada" })
            });
        });

        // 4. Navegar a la página de pedidos
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/mis_pedidos.html');

        // 5. Verificación: El botón generado en tu JS ahora debe ser visible
        // Usamos el texto exacto que definiste: "📋 Ver detalle del pedido"
        const btnVer = page.locator('button:has-text("📋 Ver detalle")').first();
        
        await expect(btnVer).toBeVisible({ timeout: 15000 });
        await btnVer.click({ force: true });

        // 6. Verificación del Toast de error
        // Tu función mostrarToast crea un div dentro de #toast-container
        const toast = page.locator('#toast-container div');
        await expect(toast).toBeVisible({ timeout: 10000 });
        await expect(toast).toContainText(/No se pudo cargar/i);

        console.log("PI-10 Completada: Se evitó la redirección y se validó el error de inconsistencia.");
    });
});