const btnToggle = document.getElementById("btnToggle");
const formContenedor = document.getElementById("formulario");
const tablaContenedor = document.getElementById("contenedorTabla");
const tbodySomos = document.getElementById("tbodySomos");
const formSomos = document.getElementById("formSomos");

// Inputs del formulario
const inputDescripcion = document.getElementById("inputDescripcion");
const inputImagen = document.getElementById("inputArchivoImagen");
const imgPreview = document.getElementById("imgPreview");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnSubmitSomos = document.getElementById("btnSubmitSomos");

// Variables globales para edición
let somosEditandoId = null;
let imagenActualUrl = null;
let somosGlobal = [];

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

const cargarSomos = async () => {
    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/somos');
        if (!respuesta.ok) throw new Error("Error de conexión");
        
        somosGlobal = await respuesta.json();
        renderizarTabla(somosGlobal);

    } catch (error) {
        console.error("Error al cargar:", error);
        tbodySomos.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-500 font-bold">Error al cargar la información.</td></tr>`;
    }
};

const renderizarTabla = (datos) => {
    tbodySomos.innerHTML = '';

    if (datos.length === 0) {
        tbodySomos.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-500 font-bold">No hay información registrada.</td></tr>`;
        return;
    }

    datos.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors border-b border-gray-100";
        
        const imagenUrl = item.imagen || "https://placehold.co/80x80?text=Sin+Imagen";
        let descripcionCorta = item.descripcion || "";
        if (descripcionCorta.length > 200) {
            descripcionCorta = descripcionCorta.substring(0, 200) + '...';
        }

        tr.innerHTML = `
            <td class="p-4 align-top text-center w-32">
                <div class="w-[80px] h-[80px] mx-auto overflow-hidden rounded-md border border-gray-300 shadow-sm bg-white flex items-center justify-center">
                    <img src="${imagenUrl}" alt="Imagen de sección" class="w-full h-full object-cover">
                </div>
            </td>
            <td class="p-4 text-[#111] text-[14px] leading-relaxed align-top text-justify">
                ${descripcionCorta}
            </td>
            <td class="p-4 text-center align-top w-32">
                <div class="flex flex-col gap-3 font-bold text-[13.5px]">
                    <button onclick="prepararEdicion(${item.id})" class="text-[#007bff] hover:underline transition-colors cursor-pointer">
                        Editar
                    </button>
                    <button onclick="eliminarSomos(${item.id})" class="text-[#dc3545] hover:underline transition-colors cursor-pointer">
                        Eliminar
                    </button>
                </div>
            </td>
        `;
        tbodySomos.appendChild(tr);
    });
};

if (inputImagen) {
    inputImagen.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (!archivo) {
            imgPreview.src = "https://placehold.co/400x300?text=Sin+Imagen";
            return;
        }

        const lector = new FileReader();
        lector.onload = (evento) => {
            imgPreview.src = evento.target.result;
        };
        lector.readAsDataURL(archivo);
    });
}

const subirImagenCloudinary = async (archivo) => {
    const CLOUD_NAME = "dcm631bku"; 
    const UPLOAD_PRESET = "unicafe_imagenes"; 

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', UPLOAD_PRESET);

    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!respuesta.ok) throw new Error("Error al subir imagen");
    const data = await respuesta.json();
    return data.secure_url; 
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
        btnToggle.textContent = "Agregar Nueva Sección";
        
        formSomos.reset();
        somosEditandoId = null;
        imagenActualUrl = null;
        imgPreview.src = "https://placehold.co/400x300?text=Sin+Imagen";
        tituloFormulario.textContent = "Agregar Nueva Sección";
        btnSubmitSomos.textContent = "Guardar Sección";
    }
};

if (btnToggle) btnToggle.addEventListener("click", toggleFormulario);

if (formSomos) {
    formSomos.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            btnSubmitSomos.textContent = "Guardando...";
            btnSubmitSomos.disabled = true;

            let urlImagenFinal = null;
            const archivoSeleccionado = inputImagen.files[0];

            if (archivoSeleccionado) {
                urlImagenFinal = await subirImagenCloudinary(archivoSeleccionado);
            } else if (somosEditandoId) {
                urlImagenFinal = imagenActualUrl;
            }

            const datos = {
                descripcion: inputDescripcion.value.trim(),
                imagen: urlImagenFinal
            };

            const metodo = somosEditandoId ? 'PUT' : 'POST';
            const url = somosEditandoId 
                ? `https://unicafe-api.vercel.app/api/somos/${somosEditandoId}`
                : `https://unicafe-api.vercel.app/api/somos`;

            const token = localStorage.getItem('token');
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error en la base de datos");

            mostrarToast(somosEditandoId ? "Sección actualizada correctamente." : "Nueva sección agregada.", "exito");
            
            toggleFormulario();
            cargarSomos(); 

        } catch (error) {
            console.error(error);
            mostrarToast("No se pudo guardar. " + error.message, "error");
        } finally {
            btnSubmitSomos.textContent = somosEditandoId ? "Actualizar Sección" : "Guardar Sección";
            btnSubmitSomos.disabled = false;
        }
    });
}

window.prepararEdicion = (id) => {
    const item = somosGlobal.find(s => s.id === id);
    if (!item) return;

    inputDescripcion.value = item.descripcion;
    imagenActualUrl = item.imagen;
    imgPreview.src = imagenActualUrl || "https://placehold.co/400x300?text=Sin+Imagen";
    
    somosEditandoId = id;
    tituloFormulario.textContent = `Editar Sección #${id}`;
    btnSubmitSomos.textContent = "Actualizar Sección";

    if (formContenedor.classList.contains("hidden")) toggleFormulario();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarSomos = async (id) => {
    const confirmado = await mostrarConfirmacion("¿Estás seguro de eliminar esta sección?");
    
    if (confirmado) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/somos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al eliminar");

            mostrarToast("Sección eliminada.", "exito");
            cargarSomos(); 

        } catch (error) {
            console.error(error);
            mostrarToast("Hubo un problema al eliminar la sección.", "error");
        }
    }
};

// Cargar datos al iniciar la página
cargarSomos();