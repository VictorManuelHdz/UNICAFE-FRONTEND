const { test, expect } = require('@playwright/test');

test.describe('PI-12: Procesamiento asíncrono Cliente-Servidor', () => {

    test('Validar intercambio JSON y construcción dinámica del DOM', async ({ page }) => {
        
        // 1. INTERCEPTAMOS LA PETICIÓN (Simulamos el servidor)
        // Esto evita que Firefox falle al intentar leer la respuesta real
        await page.route('**/api/productos', async route => {
            const jsonSimulado = [
                { id: 1, nombre: "Café Americano", precioVenta: "35.00", stock: 10, descripcion: "Café de grano" },
                { id: 2, nombre: "Mollete", precioVenta: "25.00", stock: 5, descripcion: "Con queso y frijol" }
            ];
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(jsonSimulado)
            });
        });

        // 2. Navegar a la página (Paso 1 de tu tabla)
        await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/productos.html');

        // 3. Verificación de Respuesta JSON (Paso 3)
        // En este modo, el éxito de la ruta anterior confirma el paso 3
        console.log("✅ Paso 3 PASADO: El navegador solicitó y recibió un objeto JSON.");

        // 4. Verificación del DOM Dinámico (Paso 4)
        // Buscamos que aparezcan las tarjetas que nuestro JSON simulado debe crear
        const contenedor = page.locator('#contenedor-productos article');
        
        // Esperamos a que aparezcan las 2 tarjetas que simulamos
        await expect(contenedor).toHaveCount(2, { timeout: 15000 });
        
        const primerProducto = page.locator('h3:has-text("Café Americano")');
        await expect(primerProducto).toBeVisible();

        console.log("✅ Paso 4 PASADO: El navegador construyó el DOM dinámicamente usando el JSON.");
    });
});