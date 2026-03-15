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
                alert("Formato no válido. Por favor, selecciona únicamente archivos de imagen.");
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

    listaCategoriasGlobal.forEach(cat => {
        const idCat = Number(cat.intIdCategoria || cat.id);
        const nombreCat = cat.vchCategoria || cat.nombre;
        const cantidad = platillos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat).length;

        if (cantidad > 0) {
            contenedorStats.innerHTML += `
                <div class="bg-unicafe-botones text-white px-[20px] py-[10px] rounded-[15px] font-bold shadow-unicafe flex items-center">
                    ${nombreCat}: <span class="bg-white text-unicafe-botones px-[8px] py-[2px] rounded-full ml-[5px] text-sm">${cantidad}</span>
                </div>
            `;
        }
    });
};

const renderizarMenuAgrupado = (platillos) => {
    const gridContenedor = listContainer.querySelector('.grid');
    if (!gridContenedor) return;
    gridContenedor.innerHTML = '';

    listaCategoriasGlobal.forEach(cat => {
        const idCat = Number(cat.intIdCategoria || cat.id);
        const nombreCat = cat.vchCategoria || cat.nombre;
        const platillosDeCat = platillos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat);

        if (platillosDeCat.length === 0) return;

        const section = document.createElement("section");
        section.className = "w-full bg-white border-2 border-unicafe-border rounded-[8px] p-[14px] shadow-unicafe mb-4";
        section.innerHTML = `<h3 class="text-center text-[20px] font-bold mt-1 mb-3 text-[#1f1f1f]">${nombreCat}</h3>`;

        const divArticulos = document.createElement("div");
        divArticulos.className = "flex flex-col gap-3";

        platillosDeCat.forEach(p => {
            const id = p.id || p.intIdPlatillo;
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            let avatarHTML = '';
            if (imagenUrl) {
                avatarHTML = `<img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover rounded-[5px]">`;
            } else {
                const inicial = nombre.charAt(0).toUpperCase();
                avatarHTML = `<div class="w-full h-full bg-unicafe-body text-unicafe-avatar-text text-xl font-bold rounded-[5px] flex items-center justify-center border border-unicafe-avatar-border">${inicial}</div>`;
            }

            const article = document.createElement("article");
            article.className = "w-full border-2 border-unicafe-card-border rounded-[10px] p-[12px_14px] bg-white shadow-unicafe flex flex-col";
            article.innerHTML = `
                <div class="flex items-center gap-[12px] py-[8px] border-b border-[#e4e4e4] mb-[8px]">
                    <div class="w-[50px] h-[50px] shrink-0">${avatarHTML}</div>
                    <div class="flex-1 flex flex-col gap-1 items-center text-center">
                        <strong class="text-[14px] leading-tight text-[#1f1f1f]">${nombre}</strong>
                        <span class="inline-block px-[8px] py-[3px] rounded-[8px] bg-white border border-unicafe-price-border font-bold text-[13px] text-[#333]">$${precio}</span>
                    </div>
                    <div class="flex flex-col gap-[4px] w-[65px] shrink-0">
                        <button onclick="prepararEdicion(${id})" class="bg-unicafe-btn-editar text-white font-bold text-[11px] py-[4px] rounded-[4px] text-center w-full hover:opacity-90 transition-opacity cursor-pointer">Editar</button>
                        <button onclick="eliminarPlatillo(${id})" class="bg-unicafe-btn-eliminar text-white font-bold text-[11px] py-[4px] rounded-[4px] text-center w-full hover:opacity-90 transition-opacity cursor-pointer">Eliminar</button>
                    </div>
                </div>
            `;
            divArticulos.appendChild(article);
        });

        section.appendChild(divArticulos);
        gridContenedor.appendChild(section);
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
            imagenActualUrl = null; // Limpiamos la memoria
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

            alert(platilloEditandoId ? "Platillo actualizado." : "Platillo agregado.");

            window.toggleFormulario(); 
            cargarDatosBase(); 

        } catch (error) {
            console.error(error);
            alert("No se pudo procesar la solicitud. Asegúrate de tener Cloudinary configurado. " + error.message);
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
        alert("No se pudo cargar la información para editar.");
    }
};

window.eliminarPlatillo = async (id) => {
    if (confirm("¿Estás seguro de eliminar este platillo del menú?")) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al eliminar");

            alert("Platillo eliminado correctamente.");
            cargarDatosBase();

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al eliminar.");
        }
    }
};

cargarDatosBase();