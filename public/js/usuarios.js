// ==========================================
// MÓDULO DE GESTIÓN DE USUARIOS
// ==========================================

// --- ELEMENTOS DEL DOM ---
const btnToggle = document.getElementById('btnToggleFormulario');
const contenedorForm = document.getElementById('contenedorFormulario');
const contenedorList = document.getElementById('contenedorListado');
const formUsuario = document.getElementById('formUsuario');

// --- 1. CARGA Y RENDERIZADO DE TABLA ---

const cargarUsuarios = async () => {
    try {
        const respuesta = await fetch("https://unicafe-api.vercel.app/api/usuarios");
        if (!respuesta.ok) throw new Error("Error en la conexión con la API");
        const usuarios = await respuesta.json();
        renderizarTablaUsuarios(usuarios);
    } catch (error) {
        console.error("Hubo un problema al cargar los usuarios:", error);
        document.getElementById("tabla-usuarios-body").innerHTML = `
            <tr>
                <td colspan="5" class="text-center p-4 text-red-500 font-bold border border-[#ddd]">
                    No se pudieron cargar los usuarios. Verifica la conexión.
                </td>
            </tr>
        `;
    }
};

const renderizarTablaUsuarios = (usuarios) => {
    const tbody = document.getElementById("tabla-usuarios-body");
    tbody.innerHTML = ""; 

    // Filtramos usando la llave que configuraste en tu backend (idRol o rol)
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
        // Leemos las llaves. Usamos fallback (||) por si tu backend no usó los AS temporalmente
        const id = cliente.id || cliente.intIdUsuario;
        const nombreStr = cliente.nombres || cliente.vchNombres || "";
        const apPaternoStr = cliente.apellidoPaterno || cliente.vchApaterno || "";
        const apMaternoStr = cliente.apellidoMaterno || cliente.vchAmaterno || "";
        const correo = cliente.correo || cliente.vchCorreo || "Sin correo";
        
        const nombreCompleto = `${nombreStr} ${apPaternoStr} ${apMaternoStr}`.trim() || "Sin nombre";

        const tr = document.createElement("tr");
        tr.className = "odd:bg-white even:bg-[#f9f9f9] hover:bg-gray-50 transition-colors";

        tr.innerHTML = `
            <td class="border border-[#ddd] p-3 text-center">${id}</td>
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

// --- 2. LÓGICA DE INTERFAZ Y FORMULARIO ---

const toggleVista = () => {
    if (contenedorForm.classList.contains('hidden')) {
        contenedorForm.classList.remove('hidden');
        contenedorList.classList.add('hidden');
        btnToggle.textContent = 'Ocultar Formulario';
    } else {
        contenedorForm.classList.add('hidden');
        contenedorList.classList.remove('hidden');
        btnToggle.textContent = 'Registrar Nuevo Usuario';
        if (formUsuario) formUsuario.reset(); 
    }
};

if (btnToggle) {
    btnToggle.addEventListener('click', toggleVista);
}

// Lógica de Envío POST
if (formUsuario) {
    formUsuario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const nuevoUsuario = {
            nombres: document.getElementById('nombres').value,
            apellidoPaterno: document.getElementById('apellidoPaterno').value,
            apellidoMaterno: document.getElementById('apellidoMaterno').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            direccion: document.getElementById('direccion').value,
            password: document.getElementById('password').value,
            rol: Number(document.getElementById('rol').value)
        };

        try {
            const btnSubmit = formUsuario.querySelector('button[type="submit"]');
            btnSubmit.textContent = "Guardando...";
            btnSubmit.disabled = true;

            const respuesta = await fetch("https://unicafe-api.vercel.app/api/usuarios", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            if (!respuesta.ok) throw new Error("Error al guardar en BD");

            alert("Usuario registrado con éxito.");
            formUsuario.reset();
            toggleVista();
            cargarUsuarios();

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al registrar el usuario.");
        } finally {
            const btnSubmit = formUsuario.querySelector('button[type="submit"]');
            btnSubmit.textContent = "Guardar Usuario";
            btnSubmit.disabled = false;
        }
    });
}

// --- 3. ACCIONES DE TABLA ---
const prepararEdicion = (id) => {
    alert(`Pronto podrás editar al usuario ${id}`);
};

const eliminarUsuario = (id) => {
    if (confirm(`¿Eliminar permanentemente al usuario #${id}?`)) {
        alert(`Lógica de eliminación para el ID ${id} en construcción.`);
    }
};

// Exponemos las funciones al entorno global
window.prepararEdicion = prepararEdicion;
window.eliminarUsuario = eliminarUsuario;

// ¡Arrancamos la tabla!
cargarUsuarios();