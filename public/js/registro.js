const formRegistro = document.getElementById('formRegistro');
const btnRegistrar = document.getElementById('btnRegistrar');
const mensajeAlerta = document.getElementById('mensajeAlerta');

const mostrarAlerta = (mensaje, tipo = 'exito') => {
    mensajeAlerta.textContent = mensaje;
    mensajeAlerta.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    
    if (tipo === 'exito') {
        mensajeAlerta.classList.add('bg-green-500');
    } else {
        mensajeAlerta.classList.add('bg-red-500');
    }
    
    setTimeout(() => {
        mensajeAlerta.classList.add('hidden');
    }, 4000);
};

if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombres = document.getElementById('inputNombre').value.trim();
        const apellidoPaterno = document.getElementById('inputAp').value.trim();
        const apellidoMaterno = document.getElementById('inputAm').value.trim();
        const telefono = document.getElementById('inputTelefono').value.trim();
        const correo = document.getElementById('inputCorreo').value.trim();
        const direccion = document.getElementById('inputDireccion').value.trim();
        const password = document.getElementById('inputPassword').value.trim();

        // Validación básica de seguridad
        if (password.length < 6) {
            mostrarAlerta("La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        try {
            btnRegistrar.textContent = "Registrando...";
            btnRegistrar.disabled = true;

            const nuevoUsuario = {
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                telefono,
                correo,
                direccion,
                password,
                rol: 3 
            };

            const respuesta = await fetch('https://unicafe-api.vercel.app/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(data.message || "Error al registrar");
            }

            mostrarAlerta("¡Cuenta creada con éxito! Redirigiendo al login...", "exito");
            formRegistro.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error("Error en registro:", error);
            mostrarAlerta(error.message, "error");
        } finally {
            btnRegistrar.textContent = "Registrarme";
            btnRegistrar.disabled = false;
        }
    });
}