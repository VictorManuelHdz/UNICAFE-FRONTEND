const btnToggle = document.getElementById('btnToggleFormulario');
const contenedorForm = document.getElementById('contenedorFormulario');
const contenedorList = document.getElementById('contenedorListado');
const formUsuario = document.getElementById('formUsuario');

let usuarioEditandoId = null; 

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

const cargarEmpleados = async () => {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch("https://unicafe-api.vercel.app/api/usuarios", {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!respuesta.ok) throw new Error("Error en la conexión");
        const usuarios = await respuesta.json();
        renderizarTablaEmpleados(usuarios);
    } catch (error) {
        console.error(error);
        document.getElementById("tabla-usuarios-body").innerHTML = `
            <tr><td colspan="5" class="text-center p-4 text-red-500 font-bold border border-[#ddd]">No se pudo cargar el personal. Verifica tu sesión.</td></tr>
        `;
    }
};

const renderizarTablaEmpleados = (usuarios) => {
    const tbody = document.getElementById("tabla-usuarios-body");
    tbody.innerHTML = "";

    // FILTRO: Solo Administradores (1) y Empleados (2)
    const empleados = usuarios.filter(usuario => {
        const numRol = Number(usuario.rol || usuario.intIdRol);
        return numRol === 1 || numRol === 2;
    });

    if (empleados.length === 0) {
        tbody.innerHTML = `<tr><td colspan=\"5\" class=\"text-center p-4 text-gray-500 border border-[#ddd]\">No hay personal registrado.</td></tr>`;
        return;
    }

    empleados.forEach(emp => {
        const id = emp.id || emp.intIdUsuario;
        const nombreCompleto = `${emp.nombres || emp.vchNombres || ""} ${emp.apellidoPaterno || emp.vchApaterno || ""} ${emp.apellidoMaterno || emp.vchAmaterno || ""}`.trim();
        const correo = emp.correo || emp.vchCorreo || "Sin correo";
        
        const numRol = Number(emp.rol || emp.intIdRol);
        const rolTexto = numRol === 1 ? "Administrador" : "Empleado";
        
        // Color visual para diferenciar admins de empleados rápidamente
        const colorRol = numRol === 1 ? "text-blue-600" : "text-green-600";

        const tr = document.createElement("tr");
        tr.className = "odd:bg-white even:bg-[#f9f9f9] hover:bg-gray-50 transition-colors";

        tr.innerHTML = `
            <td class="border border-[#ddd] p-3 font-medium text-[#333]">${nombreCompleto || "Sin nombre"}</td>
            <td class="border border-[#ddd] p-3 text-gray-600">${correo}</td>
            <td class="border border-[#ddd] p-3 font-semibold ${colorRol}">${rolTexto}</td>
            <td class="border border-[#ddd] p-3 whitespace-nowrap text-center">
                <button onclick="prepararEdicion(${id})" class="bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-1.5 px-3 rounded-md text-[0.9rem] mr-2 transition-all cursor-pointer">Editar</button>
                <button onclick="eliminarUsuario(${id})" class="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold py-1.5 px-3 rounded-md text-[0.9rem] transition-all cursor-pointer">Eliminar</button>
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

if (btnToggle) btnToggle.addEventListener('click', toggleVista);

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
            // CAPTURAMOS EL ROL SELECCIONADO
            rol: Number(document.getElementById('rol').value) 
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datosUsuario)
            });

            if (!respuesta.ok) {
                const errorBackend = await respuesta.json();
                throw new Error(errorBackend.error || errorBackend.message || "Error al guardar en BD");
            }

            mostrarToast(usuarioEditandoId ? "Personal actualizado." : "Personal registrado con éxito.", "exito");
            
            formUsuario.reset();

            usuarioEditandoId = null;
            document.querySelector('#contenedorFormulario h2').textContent = 'Registrar Nuevo Usuario';
            toggleVista();
            cargarEmpleados();

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
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!respuesta.ok) throw new Error("Error al obtener los datos");
        const usuario = await respuesta.json();

        document.getElementById('nombres').value = usuario.nombres || usuario.vchNombres || "";
        document.getElementById('apellidoPaterno').value = usuario.apellidoPaterno || usuario.vchApaterno || "";
        document.getElementById('apellidoMaterno').value = usuario.apellidoMaterno || usuario.vchAmaterno || "";
        document.getElementById('telefono').value = usuario.telefono || usuario.vchTelefono || "";
        document.getElementById('correo').value = usuario.correo || usuario.vchCorreo || "";
        document.getElementById('direccion').value = usuario.direccion || usuario.vchDireccion || "";
        
        document.getElementById('rol').value = usuario.rol || usuario.intIdRol || "";
        
        const inputPassword = document.getElementById('password');
        inputPassword.value = ""; 
        inputPassword.required = false; 
        inputPassword.placeholder = "Dejar en blanco para no cambiar";

        usuarioEditandoId = id;
        document.querySelector('#contenedorFormulario h2').textContent = `Editar Empleado #${id}`;
        formUsuario.querySelector('button[type="submit"]').textContent = 'Actualizar Personal';

        if (contenedorForm.classList.contains('hidden')) toggleVista();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo cargar la información para editar.", "error");
    }
};

const eliminarUsuario = async (id) => {
    const confirmado = await mostrarConfirmacion(`¿Eliminar permanentemente al empleado #${id}? Esta acción no se puede deshacer.`);
    
    if (confirmado) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al intentar eliminar");

            mostrarToast("Empleado eliminado correctamente.", "exito");
            cargarEmpleados();

        } catch (error) {
            console.error(error);
            mostrarToast("Hubo un problema al eliminar.", "error");
        }
    }
};

window.prepararEdicion = prepararEdicion;
window.eliminarUsuario = eliminarUsuario;

cargarEmpleados();