const btnToggle = document.getElementById('btnToggleFormulario');
const contenedorForm = document.getElementById('contenedorFormulario');
const contenedorList = document.getElementById('contenedorListado');
const formUsuario = document.getElementById('formUsuario');

let usuarioEditandoId = null; 

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

            alert(usuarioEditandoId ? "Personal actualizado." : "Personal registrado con éxito.");
            formUsuario.reset();
            usuarioEditandoId = null;
            document.querySelector('#contenedorFormulario h2').textContent = 'Registrar Nuevo Usuario';
            toggleVista();
            cargarEmpleados();

        } catch (error) {
            console.error(error);
            alert(`No se pudo procesar: ${error.message}`);
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
        alert("No se pudo cargar la información para editar.");
    }
};

const eliminarUsuario = async (id) => {
    if (confirm(`¿Eliminar permanentemente al empleado #${id}? Esta acción no se puede deshacer.`)) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al intentar eliminar");

            alert("Empleado eliminado correctamente.");
            cargarEmpleados();

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al eliminar.");
        }
    }
};

window.prepararEdicion = prepararEdicion;
window.eliminarUsuario = eliminarUsuario;

cargarEmpleados();