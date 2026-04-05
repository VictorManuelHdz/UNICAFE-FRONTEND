const token = localStorage.getItem('token');
const usuarioString = localStorage.getItem('usuario');

if (!token || !usuarioString) {
    window.location.href = 'login.html';
}

const usuarioActivo = JSON.parse(usuarioString);
const idUsuario = usuarioActivo.id;
const urlParams = new URLSearchParams(window.location.search);
const idEnURL = urlParams.get('id');

const formMiCuenta = document.getElementById('formMiCuenta');
const inputNombre = document.getElementById('inputNombre');
const inputAp = document.getElementById('inputAp');
const inputAm = document.getElementById('inputAm');
const inputTelefono = document.getElementById('inputTelefono');
const inputCorreo = document.getElementById('inputCorreo');
const inputDireccion = document.getElementById('inputDireccion');
const inputPassword = document.getElementById('inputPassword');
const btnGuardar = document.getElementById('btnGuardarCuenta');
const mensajeAlerta = document.getElementById('mensajeAlerta');

if (idEnURL && parseInt(idEnURL) !== idUsuario) {
    alert("⚠️ ADVERTENCIA: Uso indebido del sistema detectado. Intentando acceder a perfil ajeno.");
    
    // Redirigimos al inicio de su sesión real (limpiando la URL)
    window.location.href = 'mi_cuenta.html'; 
}

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
    }, 3000);
};

const cargarPerfil = async () => {
    try {
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${idUsuario}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error("No se pudo cargar la información");
        
        const datos = await respuesta.json();

        inputNombre.value = datos.nombres || '';
        inputAp.value = datos.apellidoPaterno || '';
        inputAm.value = datos.apellidoMaterno || '';
        inputTelefono.value = datos.telefono || '';
        inputCorreo.value = datos.correo || '';
        inputDireccion.value = datos.direccion || '';

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        mostrarAlerta("Error al cargar tus datos. Intenta recargar la página.", "error");
    }
};


if (formMiCuenta) {
    formMiCuenta.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            btnGuardar.textContent = "Guardando...";
            btnGuardar.disabled = true;

            // Preparamos el objeto con las llaves exactas que espera actualizarUsuario en el backend
            const datosActualizados = {
                nombres: inputNombre.value.trim(),
                apellidoPaterno: inputAp.value.trim(),
                apellidoMaterno: inputAm.value.trim(),
                telefono: inputTelefono.value.trim(),
                direccion: inputDireccion.value.trim()
            };

            // Solo enviamos la contraseña si el usuario escribió algo
            const nuevaPassword = inputPassword.value.trim();
            if (nuevaPassword !== "") {
                datosActualizados.password = nuevaPassword;
            }

            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${idUsuario}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!respuesta.ok) throw new Error("Error al guardar en la base de datos");

            mostrarAlerta("¡Tus datos han sido actualizados con éxito!", "exito");
            inputPassword.value = ''; 

            usuarioActivo.nombre = datosActualizados.nombres;
            localStorage.setItem('usuario', JSON.stringify(usuarioActivo));
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error(error);
            mostrarAlerta("Hubo un problema al actualizar tu información.", "error");
        } finally {
            btnGuardar.textContent = "Guardar Cambios";
            btnGuardar.disabled = false;
        }
    });
}

cargarPerfil();