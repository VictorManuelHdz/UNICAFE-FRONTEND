const btnToggle = document.getElementById("btnToggle");
const formContenedor = document.getElementById("formulario");
const tablaContenedor = document.getElementById("contenedorTabla");
const tbodyTerminos = document.getElementById("tbodyTerminos");
const formTermino = document.getElementById("formTermino");

// Inputs del formulario
const inputTitulo = document.getElementById("inputTitulo");
const inputContenido = document.getElementById("inputContenido");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnSubmitTermino = document.getElementById("btnSubmitTermino");

// Estado Global
let terminoEditandoId = null;
let terminosGlobal = [];

const cargarTerminos = async () => {
    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/terminos');
        if (!respuesta.ok) throw new Error("Error de conexión");
        
        terminosGlobal = await respuesta.json();
        renderizarTabla(terminosGlobal);

    } catch (error) {
        console.error("Error al cargar:", error);
        tbodyTerminos.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-500 font-bold">Error al cargar los términos.</td></tr>`;
    }
};

const renderizarTabla = (terminos) => {
    tbodyTerminos.innerHTML = '';

    if (terminos.length === 0) {
        tbodyTerminos.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500 font-bold">Aún no hay términos registrados.</td></tr>`;
        return;
    }

    terminos.forEach(termino => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors border-b border-gray-100";
        
        let descripcionCorta = termino.contenido;
        if (descripcionCorta.length > 250) {
            descripcionCorta = descripcionCorta.substring(0, 250) + '...';
        }

        tr.innerHTML = `
            <td class="p-4 font-extrabold text-[#1f1f1f] align-top w-1/4 uppercase text-[13.5px]">
                ${termino.titulo}
            </td>
            <td class="p-4 text-[#2c2a2a] text-[13.5px] leading-relaxed align-top text-justify">
                ${descripcionCorta}
            </td>
            <td class="p-4 text-center align-top">
                <div class="flex justify-center gap-3 font-bold text-[13.5px]">
                    <button onclick="prepararEdicion(${termino.id})" class="text-[#007bff] hover:underline transition-colors cursor-pointer">
                        Editar
                    </button>
                    <button onclick="eliminarTermino(${termino.id})" class="text-[#dc3545] hover:underline transition-colors cursor-pointer">
                        Eliminar
                    </button>
                </div>
            </td>
        `;
        tbodyTerminos.appendChild(tr);
    });
};

window.toggleFormulario = () => {
    const isHidden = formContenedor.classList.contains("hidden");

    if (isHidden) {
        formContenedor.classList.remove("hidden");
        tablaContenedor.classList.add("hidden");
        btnToggle.textContent = "Ocultar Formulario";
    } else {
        formContenedor.classList.add("hidden");
        tablaContenedor.classList.remove("hidden");
        btnToggle.textContent = "Agregar Nuevo Término";
        
        formTermino.reset();
        terminoEditandoId = null;
        tituloFormulario.textContent = "Agregar nuevo término";
        btnSubmitTermino.textContent = "Guardar Término";
    }
};

if (btnToggle) btnToggle.addEventListener("click", toggleFormulario);

if (formTermino) {
    formTermino.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            btnSubmitTermino.textContent = "Guardando...";
            btnSubmitTermino.disabled = true;

            const datos = {
                titulo: inputTitulo.value.trim(),
                contenido: inputContenido.value.trim()
            };

            const metodo = terminoEditandoId ? 'PUT' : 'POST';
            const url = terminoEditandoId 
                ? `https://unicafe-api.vercel.app/api/terminos/${terminoEditandoId}`
                : `https://unicafe-api.vercel.app/api/terminos`;

            const token = localStorage.getItem('token');
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error en la base de datos");

            alert(terminoEditandoId ? "Término actualizado correctamente." : "Nuevo término agregado.");
            
            toggleFormulario(); 
            cargarTerminos();   

        } catch (error) {
            console.error(error);
            alert("No se pudo guardar el término. " + error.message);
        } finally {
            btnSubmitTermino.textContent = terminoEditandoId ? "Actualizar Término" : "Guardar Término";
            btnSubmitTermino.disabled = false;
        }
    });
}

window.prepararEdicion = (id) => {
    const termino = terminosGlobal.find(t => t.id === id);
    if (!termino) return;

    inputTitulo.value = termino.titulo;
    inputContenido.value = termino.contenido;
    
    terminoEditandoId = id;
    tituloFormulario.textContent = `Editar Término #${id}`;
    btnSubmitTermino.textContent = "Actualizar Término";

    if (formContenedor.classList.contains("hidden")) {
        toggleFormulario();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarTermino = async (id) => {
    if (confirm("¿Estás seguro de eliminar este término? Esta acción no se puede deshacer.")) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/terminos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al eliminar");

            alert("Término eliminado correctamente.");
            cargarTerminos(); 

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al eliminar el término.");
        }
    }
};

// Cargar datos al iniciar la página
cargarTerminos();