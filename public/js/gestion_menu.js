const btnFormulario = document.getElementById('btnMostrarFormulario');
const formContainer = document.getElementById('formularioPlatillo');
const listContainer = document.getElementById('listadoProductos');
const estadisticas = document.getElementById('estadisticasMenu');
const formPlatillo = document.getElementById('formPlatillo');
const inputImagen = document.getElementById('imagenPlatillo');
const textoArchivo = document.getElementById('textoNombreArchivo');
const imgPrevia = document.getElementById('imgPrevia');
const placeholderPrevia = document.getElementById('placeholderPrevia');

let platilloEditandoId = null;
let listaCategoriasGlobal = [];
let imagenActualUrl = null;

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

const restaurarEstadoPrevia = () => {
    if (textoArchivo) {
        textoArchivo.textContent = "Ninguna imagen seleccionada";
        textoArchivo.classList.add('text-gray-500', 'italic');
        textoArchivo.classList.remove('text-[#0e3a23]', 'font-semibold');
    }
    if (imgPrevia) {
        imgPrevia.src = "";
        imgPrevia.classList.add('hidden');
    }
    if (placeholderPrevia) {
        placeholderPrevia.classList.remove('hidden');
    }
};

// Evento cuando el usuario selecciona un archivo
if (inputImagen) {
    inputImagen.addEventListener('change', (e) => {
        const archivo = e.target.files[0];

        if (archivo) {
            // Verificamos que el archivo sea estrictamente una imagen (jpeg, png, gif, webp, etc.)
            if (!archivo.type.startsWith('image/')) {
                
                mostrarToast("Formato no válido. Por favor, selecciona únicamente archivos de imagen.", "error");
                e.target.value = "";
                restaurarEstadoPrevia();
                return;
            }

            textoArchivo.textContent = archivo.name;
            textoArchivo.classList.remove('text-gray-500', 'italic');
            textoArchivo.classList.add('text-[#0e3a23]', 'font-semibold');

            const lector = new FileReader();
            lector.onload = function (evento) {
                imgPrevia.src = evento.target.result;
                imgPrevia.classList.remove('hidden');
                placeholderPrevia.classList.add('hidden');
            }
            lector.readAsDataURL(archivo);
        } else {
            restaurarEstadoPrevia();
        }
    });
}

const cargarDatosBase = async () => {
    try {
        const [resCategorias, resPlatillos] = await Promise.all([
            fetch("https://unicafe-api.vercel.app/api/categorias-menu"),
            fetch("https://unicafe-api.vercel.app/api/menu")
        ]);

        if (!resCategorias.ok || !resPlatillos.ok) throw new Error("Error en la conexión");

        listaCategoriasGlobal = await resCategorias.json();
        const platillos = await resPlatillos.json();

        llenarSelectCategorias();
        renderizarEstadisticas(platillos);
        renderizarMenuAgrupado(platillos);
    } catch (error) {
        console.error("Error al cargar:", error);
        listContainer.innerHTML = "<p class='text-center text-red-500 font-bold mt-10'>Error al cargar el menú.</p>";
    }
};

const llenarSelectCategorias = () => {
    const select = document.getElementById('categoriaPlatillo');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione una categoría...</option>';
    listaCategoriasGlobal.forEach(cat => {
        const idCat = cat.intIdCategoria || cat.id;
        const nombreCat = cat.vchCategoria || cat.nombre;
        select.innerHTML += `<option value="${idCat}">${nombreCat}</option>`;
    });
};

const renderizarEstadisticas = (platillos) => {
    if (!estadisticas) return;
    const contenedorStats = estadisticas.querySelector('div');
    contenedorStats.innerHTML = '';

    const totalPlatillos = platillos.length;

    if (totalPlatillos === 0) {
        estadisticas.classList.add('hidden');
        return;
    }

    estadisticas.classList.remove('hidden');

    listaCategoriasGlobal.forEach(cat => {
        const idCat = Number(cat.intIdCategoria || cat.id);
        const nombreCat = cat.vchCategoria || cat.nombre;
        const cantidad = platillos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat).length;

        const porcentaje = (cantidad / totalPlatillos) * 100;

        if (cantidad > 0) {
            contenedorStats.innerHTML += `
                <div class="bg-white p-4 rounded-xl border border-unicafe-border shadow-sm flex flex-col gap-2">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-unicafe-header-dark text-sm">${nombreCat}</span>
                        <span class="text-xs font-black text-unicafe-botones">${cantidad} platillos (${porcentaje.toFixed(0)}%)</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                        <div class="bg-unicafe-botones h-full rounded-full transition-all duration-1000" 
                             style="width: ${porcentaje}%"></div>
                    </div>
                </div>
            `;
        }
    });
};

const renderizarMenuAgrupado = (platillos) => {
    const contenedorColumnas = document.getElementById('contenedorColumnas');
    if (!contenedorColumnas) return;
    contenedorColumnas.innerHTML = '';

    listaCategoriasGlobal.forEach(cat => {
        const idCat = Number(cat.intIdCategoria || cat.id);
        const nombreCat = cat.vchCategoria || cat.nombre;
        const platillosDeCat = platillos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat);

        if (platillosDeCat.length === 0) return;

        const section = document.createElement("section");
        section.className = "flex flex-col bg-white border-2 border-unicafe-border rounded-lg p-[14px] shadow-sm transition-all h-full";
        section.innerHTML = `<h3 class="text-center text-xl font-bold mt-1 mb-3 text-unicafe-header-dark">${nombreCat}</h3>`;

        const divArticulos = document.createElement("div");
        divArticulos.className = "flex flex-col gap-3 h-full";

        platillosDeCat.forEach(p => {
            const id = p.id || p.intIdPlatillo;
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            const inicial = nombre.charAt(0).toUpperCase();

            let avatarHTML = '';

            if (imagenUrl && imagenUrl.trim() !== '') {
                avatarHTML = `
                <div class="w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#eee] flex items-center justify-center">
                    <img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover" onerror="reemplazarImagenRotaGestionMenu(this, '${inicial}')">
                </div>`;
            } else {
                avatarHTML = `
                <div class="w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-xl flex items-center justify-center">
                    ${inicial}
                </div>`;
            }

            const article = document.createElement("article");
            article.className = "border-2 border-unicafe-card-border rounded-[10px] p-3 bg-white shadow-sm flex items-center gap-3";

            article.innerHTML = `
                ${avatarHTML}
                <div class="flex-1 min-w-0">
                    <strong class="text-[13px] block truncate text-[#333]">${nombre}</strong>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded border border-unicafe-price-border font-bold text-[12px] text-[#333]">$${precio}</span>
                </div>
                <div class="flex flex-col gap-1 w-[65px] shrink-0">
                    <button onclick="prepararEdicion(${id})" class="bg-unicafe-btn-editar text-white font-bold text-[10px] py-1.5 rounded-[4px] text-center w-full hover:opacity-90 transition-opacity">Editar</button>
                    <button onclick="eliminarPlatillo(${id})" class="bg-unicafe-btn-eliminar text-white font-bold text-[10px] py-1.5 rounded-[4px] text-center w-full hover:opacity-90 transition-opacity">Borrar</button>
                </div>
            `;
            divArticulos.appendChild(article);
        });

        section.appendChild(divArticulos);
        contenedorColumnas.appendChild(section);
    });
};

const subirImagenCloudinary = async (archivo) => {
    const CLOUD_NAME = "dcm631bku";
    const UPLOAD_PRESET = "unicafe_imagenes";

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!respuesta.ok) throw new Error("Error al subir imagen a la nube");

        const data = await respuesta.json();

        return data.secure_url;

    } catch (error) {
        console.error("Error en Cloudinary:", error);
        throw error;
    }
};

window.toggleFormulario = () => {
    if (formContainer.classList.contains('hidden')) {
        formContainer.classList.remove('hidden');
        listContainer.classList.add('hidden');
        if (estadisticas) estadisticas.classList.add('hidden');
        btnFormulario.textContent = 'Ocultar Formulario';
    } else {
        formContainer.classList.add('hidden');
        listContainer.classList.remove('hidden');
        if (estadisticas) estadisticas.classList.remove('hidden');
        btnFormulario.textContent = 'Agregar Platillo';

        if (formPlatillo) {
            formPlatillo.reset();
            platilloEditandoId = null;
            imagenActualUrl = null; 
            restaurarEstadoPrevia();

            document.getElementById('tituloFormulario').textContent = 'Agregar nuevo platillo';
            document.getElementById('btnSubmitPlatillo').textContent = 'Agregar platillo';
        }
    }
};

if (btnFormulario) btnFormulario.addEventListener('click', toggleFormulario);

if (formPlatillo) {
    formPlatillo.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const btnSubmit = document.getElementById('btnSubmitPlatillo');
            btnSubmit.textContent = "Procesando imagen...";
            btnSubmit.disabled = true;

            let urlImagenFinal = null;
            const archivoSeleccionado = document.getElementById('imagenPlatillo').files[0];

            if (archivoSeleccionado) {
                urlImagenFinal = await subirImagenCloudinary(archivoSeleccionado);
            } else if (platilloEditandoId) {
                urlImagenFinal = imagenActualUrl;
            }

            btnSubmit.textContent = "Guardando base de datos...";

            const datos = {
                idCategoria: Number(document.getElementById('categoriaPlatillo').value),
                nombre: document.getElementById('nombrePlatillo').value,
                precio: parseFloat(document.getElementById('precioPlatillo').value),
                imagen: urlImagenFinal
            };

            const metodo = platilloEditandoId ? 'PUT' : 'POST';
            const url = platilloEditandoId
                ? `https://unicafe-api.vercel.app/api/menu/${platilloEditandoId}`
                : "https://unicafe-api.vercel.app/api/menu";

            const token = localStorage.getItem('token');
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error al guardar en BD");

            mostrarToast(platilloEditandoId ? "Platillo actualizado." : "Platillo agregado.", "exito");

            window.toggleFormulario();
            cargarDatosBase();

        } catch (error) {
            console.error(error);
            mostrarToast("No se pudo procesar la solicitud. " + error.message, "error");
        } finally {
            const btnSubmit = document.getElementById('btnSubmitPlatillo');
            btnSubmit.textContent = platilloEditandoId ? "Actualizar platillo" : "Agregar platillo";
            btnSubmit.disabled = false;
        }
    });
}

window.prepararEdicion = async (id) => {
    try {
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/menu/${id}`);
        if (!respuesta.ok) throw new Error("Error al obtener datos");

        const platillo = await respuesta.json();

        document.getElementById('categoriaPlatillo').value = platillo.idCategoria || platillo.intIdCategoria;
        document.getElementById('nombrePlatillo').value = platillo.nombre || platillo.vchNombre;
        document.getElementById('precioPlatillo').value = platillo.precio || platillo.decPrecio;

        const inputFile = document.getElementById('imagenPlatillo');
        if (inputFile) inputFile.value = "";

        imagenActualUrl = platillo.imagen || platillo.vchImagen || null;

        if (imagenActualUrl) {
            textoArchivo.textContent = "Usando imagen actual (Click para cambiar)";
            textoArchivo.classList.remove('text-gray-500', 'italic');
            textoArchivo.classList.add('text-[#0e3a23]', 'font-semibold');

            imgPrevia.src = imagenActualUrl;
            imgPrevia.classList.remove('hidden');
            placeholderPrevia.classList.add('hidden');
        } else {
            restaurarEstadoPrevia();
        }

        platilloEditandoId = id;
        document.getElementById('tituloFormulario').textContent = `Editar Platillo #${id}`;
        document.getElementById('btnSubmitPlatillo').textContent = 'Actualizar platillo';

        if (formContainer.classList.contains('hidden')) window.toggleFormulario();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo cargar la información para editar.", "error");
    }
};

window.eliminarPlatillo = async (id) => {
    const confirmado = await mostrarConfirmacion("¿Estás seguro de eliminar este platillo del menú?");
    
    if (confirmado) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al eliminar");

            mostrarToast("Platillo eliminado correctamente.", "exito");
            cargarDatosBase();

        } catch (error) {
            console.error(error);
            mostrarToast("Hubo un problema al eliminar.", "error");
        }
    }
};

cargarDatosBase();

window.reemplazarImagenRotaGestionMenu = (imgElement, inicial) => {
    const contenedorPadre = imgElement.parentElement;
    
    contenedorPadre.className = "w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-xl flex items-center justify-center";
    
    contenedorPadre.innerHTML = inicial; 
};