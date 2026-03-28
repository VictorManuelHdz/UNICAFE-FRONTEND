const { test, expect } = require('@playwright/test');

// Proyecto No: 1 - Sistema de gestión de inventario de una cafetería
// ID de caso de prueba: PI-01
test.describe('Módulo de Usuarios y Roles - Integración', () => {

  test('PI-01: Validación de IdRol inexistente al registrar administrador', async ({ page }) => {
    
    // 1. ESCENARIO CAJA GRIS: Interceptamos la petición POST
    // Simulamos que el servidor responde con error de integridad (IdRol no existe)
    await page.route('https://unicafe-api.vercel.app/api/usuarios', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: false, 
          message: "No se pudo procesar: Error de integridad referencial. El IdRol no existe." 
        })
      });
    });

    // 2. NAVEGACIÓN (Asegúrate de que la URL sea la de tu gestión de usuarios)
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/usuarios.html'); 

    // 3. ACCIÓN: Abrir formulario y llenar datos
    // Si el formulario está oculto, hacemos clic en el botón de registrar
    const btnToggle = page.locator('#btnToggleFormulario');
    await btnToggle.click();

    await page.fill('#nombres', 'Admin de Prueba');
    await page.fill('#apellidoPaterno', 'Hernandez');
    await page.fill('#apellidoMaterno', 'Prueba');
    await page.fill('#telefono', '7711234567');
    await page.fill('#correo', 'test_error@unicafe.com');
    await page.fill('#direccion', 'Calle Falsa 123');
    await page.fill('#password', 'admin123');

    // 4. INTENTAR GUARDAR
    // El script de tu app enviará el JSON y recibirá el error 400 que simulamos
    await page.click('button[type="submit"]');

    // 5. VALIDAR RESPUESTA (Paso 4 de tu tabla)
    // Tu función mostrarToast() crea un div con id 'toast-notification'
    const toastError = page.locator('#toast-notification');
    
    // Verificamos que el toast aparezca y tenga el color de error (#e76f51)
    await expect(toastError).toBeVisible();
    await expect(toastError).toContainText(/No se pudo procesar/i);
    await expect(toastError).toHaveClass(/bg-\[#e76f51\]/); // Color naranja/rojo de tu Toast

    // 6. CONSULTAR BASE DE DATOS (Lógica de Caja Gris)
    // Verificamos que el formulario NO se haya reseteado (sigue visible)
    // lo que indica que el registro no se insertó.
    const formulario = page.locator('#contenedorFormulario');
    await expect(formulario).not.toHaveClass(/hidden/);
    
    console.log("Prueba PI-01 Exitosa: El sistema bloqueó el registro por IdRol inválido.");
  });

});