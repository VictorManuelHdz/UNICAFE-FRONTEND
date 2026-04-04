const btnToggle = document.getElementById('btnToggleFormulario');
const contenedorForm = document.getElementById('contenedorFormulario');
const contenedorList = document.getElementById('contenedorListado');
const formUsuario = document.getElementById('formUsuario');

const mostrarToast = (mensaje, tipo = 'exito') => {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 right-6 z-[9999] transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold';
        toast.innerHTML = `<span id="toast-icon" class="text-2xl"></span><span id="toast-message"></span>`;
        document.body.appendChild(toast);
    }

    toast.querySelector('#toast-message').textContent = mensaje;
    toast.classList.remove('bg-[#2A9D8F]', 'bg-[#e76f51]');

    if (tipo === 'exito') {
        toast.classList.add('bg-[#2A9D8F]');
        toast.querySelector('#toast-icon').textContent = '✅';
    } else {
        toast.classList.add('bg-[#e76f51]');
        toast.querySelector('#toast-icon').textContent = '⚠️';
    }

    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 3000);
};

const mostrarConfirmacion = (mensaje) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-confirmacion');
        const caja = document.getElementById('modal-confirmacion-caja');

        document.getElementById('modal-confirmacion-mensaje').textContent = mensaje;

        // Mostrar modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            caja.classList.remove('scale-95');
        }, 10);

        const cerrarYResolver = (resultado) => {
            modal.classList.add('opacity-0');
            caja.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                resolve(resultado);
            }, 300);
        };

        document.getElementById('btn-cancelar-accion').onclick = () => cerrarYResolver(false);
        document.getElementById('btn-confirmar-accion').onclick = () => cerrarYResolver(true);
    });
};

let usuarioEditandoId = null;

const cargarUsuarios = async () => {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch("https://unicafe-api.vercel.app/api/usuarios", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        manejarRespuestaSeguridad(respuesta);

        if (!respuesta.ok) throw new Error("Error en la conexión con la API");
        const usuarios = await respuesta.json();
        renderizarTablaUsuarios(usuarios);
    } catch (error) {
        console.error("Hubo un problema al cargar los usuarios:", error);
        document.getElementById("tabla-usuarios-body").innerHTML = `
            <tr>
                <td colspan="5" class="text-center p-4 text-red-500 font-bold border border-[#ddd]">
                    No se pudieron cargar los usuarios. Verifica la conexión o tu sesión.
                </td>
            </tr>
        `;
    }
};

const renderizarTablaUsuarios = (usuarios) => {
    const tbody = document.getElementById("tabla-usuarios-body");
    tbody.innerHTML = "";

    const clientes = usuarios.filter(usuario => {
        const numRol = usuario.rol || usuario.intIdRol;
        return Number(numRol) === 3;
    });

    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center p-4 text-gray-500 border border-[#ddd]">
                    No hay clientes registrados actualmente.
                </td>
            </tr>
        `;
        return;
    }

    clientes.forEach(cliente => {
        const id = cliente.id || cliente.intIdUsuario;
        const nombreStr = cliente.nombres || cliente.vchNombres || "";
        const apPaternoStr = cliente.apellidoPaterno || cliente.vchApaterno || "";
        const apMaternoStr = cliente.apellidoMaterno || cliente.vchAmaterno || "";
        const correo = cliente.correo || cliente.vchCorreo || "Sin correo";

        const nombreCompleto = `${nombreStr} ${apPaternoStr} ${apMaternoStr}`.trim() || "Sin nombre";

        const tr = document.createElement("tr");
        tr.className = "odd:bg-white even:bg-[#f9f9f9] hover:bg-gray-50 transition-colors";

        tr.innerHTML = `
            <td class="border border-[#ddd] p-3 font-medium text-[#333]">${nombreCompleto}</td>
            <td class="border border-[#ddd] p-3 text-gray-600">${correo}</td>
            <td class="border border-[#ddd] p-3 text-gray-600 font-semibold">Cliente</td>
            <td class="border border-[#ddd] p-3 whitespace-nowrap text-center">
                <button onclick="prepararEdicion(${id})" class="bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-1.5 px-3 rounded-md text-[0.9rem] mr-2 transition-all cursor-pointer">
                    Editar
                </button>
                <button onclick="eliminarUsuario(${id})" class="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold py-1.5 px-3 rounded-md text-[0.9rem] transition-all cursor-pointer">
                    Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
};

const toggleVista = () => {
    const inputPassword = document.getElementById('password');

    if (contenedorForm.classList.contains('hidden')) {
        contenedorForm.classList.remove('hidden');
        contenedorList.classList.add('hidden');
        btnToggle.textContent = 'Cancelar / Ocultar Formulario';
    } else {
        contenedorForm.classList.add('hidden');
        contenedorList.classList.remove('hidden');
        btnToggle.textContent = 'Registrar Nuevo Usuario';

        if (formUsuario) {
            formUsuario.reset();
            usuarioEditandoId = null;
            document.querySelector('#contenedorFormulario h2').textContent = 'Registrar Nuevo Usuario';
            formUsuario.querySelector('button[type="submit"]').textContent = 'Guardar Usuario';

            if (inputPassword) {
                inputPassword.required = true;
                inputPassword.placeholder = "";
            }
        }
    }
};

if (btnToggle) {
    btnToggle.addEventListener('click', toggleVista);
}

const manejarRespuestaSeguridad = (respuesta) => {
    if (respuesta.status === 401 || respuesta.status === 403) {
        alert("⚠️ SEGURIDAD: Se ha detectado una alteración en la integridad de la sesión. Su acceso ha sido revocado.");
        // Destruimos el localStorage alterado
        localStorage.clear();
        // Expulsamos al usuario a la pantalla de inicio
        window.location.href = '../login.html';
        throw new Error("Sesión invalidada por seguridad.");
    }
    return respuesta;
};

// Lógica de Envío POST / PUT
if (formUsuario) {
    formUsuario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const datosUsuario = {
            nombres: document.getElementById('nombres').value,
            apellidoPaterno: document.getElementById('apellidoPaterno').value,
            apellidoMaterno: document.getElementById('apellidoMaterno').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            direccion: document.getElementById('direccion').value,
            password: document.getElementById('password').value,
            rol: 3
        };

        try {
            const btnSubmit = formUsuario.querySelector('button[type="submit"]');
            btnSubmit.textContent = "Procesando...";
            btnSubmit.disabled = true;

            const metodo = usuarioEditandoId ? 'PUT' : 'POST';
            const url = usuarioEditandoId
                ? `https://unicafe-api.vercel.app/api/usuarios/${usuarioEditandoId}`
                : "https://unicafe-api.vercel.app/api/usuarios";

            const token = localStorage.getItem('token');

            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosUsuario)
            });

            manejarRespuestaSeguridad(respuesta);

            if (!respuesta.ok) {
                const errorBackend = await respuesta.json();
                throw new Error(errorBackend.error || errorBackend.message || "Error al guardar en BD");
            }

            mostrarToast(usuarioEditandoId ? "Usuario actualizado correctamente." : "Usuario registrado con éxito.", "exito");

            formUsuario.reset();
            usuarioEditandoId = null;

            document.querySelector('#contenedorFormulario h2').textContent = 'Registrar Nuevo Usuario';

            toggleVista();
            cargarUsuarios();

        } catch (error) {
            console.error(error);
            mostrarToast(`No se pudo procesar: ${error.message}`, "error");
        } finally {
            const btnSubmit = formUsuario.querySelector('button[type="submit"]');
            btnSubmit.textContent = "Guardar Usuario";
            btnSubmit.disabled = false;
        }
    });
}

const prepararEdicion = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) throw new Error("Error al obtener los datos del usuario");

        const usuario = await respuesta.json();

        // Llenamos el formulario
        document.getElementById('nombres').value = usuario.nombres || usuario.vchNombres || "";
        document.getElementById('apellidoPaterno').value = usuario.apellidoPaterno || usuario.vchApaterno || "";
        document.getElementById('apellidoMaterno').value = usuario.apellidoMaterno || usuario.vchAmaterno || "";
        document.getElementById('telefono').value = usuario.telefono || usuario.vchTelefono || "";
        document.getElementById('correo').value = usuario.correo || usuario.vchCorreo || "";
        document.getElementById('direccion').value = usuario.direccion || usuario.vchDireccion || "";

        // CONFIGURAMOS LA CONTRASEÑA EN MODO "EDITAR"
        const inputPassword = document.getElementById('password');
        inputPassword.value = "";
        inputPassword.required = false; // Ya no es obligatoria
        inputPassword.placeholder = "Dejar en blanco para no cambiar";

        usuarioEditandoId = id;

        // Cambiamos la estética del formulario
        document.querySelector('#contenedorFormulario h2').textContent = `Editar Usuario #${id}`;
        formUsuario.querySelector('button[type="submit"]').textContent = 'Actualizar Usuario';

        if (contenedorForm.classList.contains('hidden')) {
            toggleVista();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo cargar la información del usuario para editar.", "error");
    }
};

const eliminarUsuario = async (id) => {
    const confirmado = await mostrarConfirmacion(`¿Deseas eliminar permanentemente al usuario #${id}?`);

    if (confirmado) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!respuesta.ok) throw new Error("Error al intentar eliminar el usuario");

            mostrarToast("Usuario eliminado correctamente.", "exito");
            cargarUsuarios();

        } catch (error) {
            console.error(error);
            mostrarToast("Hubo un problema al eliminar el usuario.", "error");
        }
    }
};

window.prepararEdicion = prepararEdicion;
window.eliminarUsuario = eliminarUsuario;

// Cargamos los usuarios al iniciar la página
cargarUsuarios();