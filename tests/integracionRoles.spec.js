const { test, expect } = require('@playwright/test');

test.describe('Módulo de Empleados - Prueba de Integración PI-01', () => {

  test('Validación de IdRol inexistente al registrar personal', async ({ page }) => {
    
    // 1. SIMULACIÓN DE SESIÓN (Injectamos token para evitar el 401)
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'token_simulado_uthh_2026');
    });
    // Simulamos que al enviar el formulario, el backend detecta que el ID de rol no existe
    await page.route('https://unicafe-api.vercel.app/api/usuarios', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            message: "El IdRol seleccionado no es válido o no existe en la base de datos." 
          })
        });
      } else {
        // Para la carga inicial de la tabla (cargarEmpleados) devolvemos vacío
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });
    // Ajusta esta URL a la ruta real de tu archivo de empleados
    await page.goto('https://victormanuelhdz.github.io/UNICAFE-FRONTEND/public/empleados.html'); 

    // 4. ACCIÓN: Mostrar formulario y llenar datos
    const btnToggle = page.locator('#btnToggleFormulario');
    await btnToggle.click();

    await page.fill('#nombres', 'Empleado');
    await page.fill('#apellidoPaterno', 'Prueba');
    await page.fill('#apellidoMaterno', 'Inexistente');
    await page.fill('#telefono', '7711234567');
    await page.fill('#correo', 'error_rol@test.com');
    await page.fill('#direccion', 'Campus UTHH');
    await page.fill('#password', 'admin123');
    // Usamos fill o selectOption dependiendo de si es input o select
    await page.locator('#rol').evaluate((node) => {
    node.innerHTML += '<option value="99">Rol Inexistente</option>';
    node.value = '99';}); 

    // 5. INTENTAR GUARDAR
    await page.click('button[type="submit"]');

    // 6. VERIFICACIÓN DEL RESULTADO ESPERADO
    // Buscamos el Toast naranja que genera tu función mostrarToast(..., "error")
    const toastError = page.locator('#toast-notification');
    
    await expect(toastError).toBeVisible({ timeout: 5000 });
    // Verificamos que contenga el mensaje de error que configuramos en el interceptor
    await expect(toastError).toContainText(/No se pudo procesar: El IdRol seleccionado no es válido/i);

    // Verificamos que el formulario NO se cerró (sigue visible)
    const contenedorForm = page.locator('#contenedorFormulario');
    await expect(contenedorForm).not.toHaveClass(/hidden/);

    console.log("PI-01 Completada: El sistema rechazó el IdRol inexistente correctamente.");
    await page.waitForTimeout(5000);
  });

});