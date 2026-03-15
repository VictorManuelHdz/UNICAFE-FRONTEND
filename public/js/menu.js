// ==========================================
// MÓDULO DEL MENÚ PÚBLICO (CLIENTES)
// ==========================================

const contenedorMenu = document.getElementById('menuPublicoContenedor');
const mensajeCarga = document.getElementById('mensajeCarga');

let categoriasGlobal = [];
let platillosGlobal = [];
let platilloSeleccionado = null;
let cantidadActual = 1;

// --- 1. CARGA DE DATOS DESDE LA API ---
const cargarMenuPublico = async () => {
    try {
        // Hacemos las dos peticiones al mismo tiempo
        const [resCategorias, resPlatillos] = await Promise.all([
            fetch("https://unicafe-api.vercel.app/api/categorias-menu"),
            fetch("https://unicafe-api.vercel.app/api/menu")
        ]);

        if (!resCategorias.ok || !resPlatillos.ok) throw new Error("Error en la conexión");

        categoriasGlobal = await resCategorias.json();
        platillosGlobal = await resPlatillos.json();

        // Ocultamos el mensaje de carga...
        if (mensajeCarga) mensajeCarga.style.display = 'none';

        renderizarMenu(categoriasGlobal, platillosGlobal);

    } catch (error) {
        console.error("Error al cargar el menú:", error);
        contenedorMenu.innerHTML = `
            <div class="col-span-full text-center p-8 bg-white border border-red-200 rounded-lg shadow-sm">
                <p class="text-red-500 font-bold text-lg">Uy, tuvimos un problema al cargar el menú hoy.</p>
                <p class="text-gray-500 mt-2">Por favor, recarga la página en unos momentos.</p>
            </div>
        `;
    }
};

// --- 2. RENDERIZADO VISUAL (DISEÑO ORIGINAL EQUILIBRADO) ---
const renderizarMenu = (categorias, platillos) => {
    contenedorMenu.innerHTML = '';

    if (platillos.length === 0) {
        contenedorMenu.innerHTML = `<p class="col-span-full text-center text-gray-500 font-bold">Actualmente no hay platillos disponibles.</p>`;
        return;
    }

    categorias.forEach(cat => {
        const idCat = Number(cat.intIdCategoria || cat.id);
        const nombreCat = cat.vchCategoria || cat.nombre;
        const platillosDeCat = platillos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat);

        if (platillosDeCat.length === 0) return;

        // 1. Sección de Categoría (Compacta)
        const section = document.createElement("section");
        section.className = "flex flex-col bg-white border-2 border-unicafe-border rounded-lg p-[14px] shadow-sm transition-all hover:shadow-md h-full";
        section.innerHTML = `<h3 class="text-center text-xl font-bold mt-1 mb-3 text-unicafe-header-dark">${nombreCat}</h3>`;

        // 2. Contenedor de platillos (Lista vertical)
        const divArticulos = document.createElement("div");
        divArticulos.className = "flex flex-col gap-3 h-full";

        platillosDeCat.forEach(p => {
            const id = p.id || p.intIdPlatillo;
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            let avatarHTML = '';
            // Tamaño de imagen original (60px) que no satura la tarjeta
            let contenedorAvatarClases = "w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#eee] flex items-center justify-center text-unicafe-avatar-text font-bold text-xl";

            if (imagenUrl) {
                avatarHTML = `<img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover">`;
            } else {
                const inicial = nombre.charAt(0).toUpperCase();
                contenedorAvatarClases = "w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-xl flex items-center justify-center";
                avatarHTML = inicial;
            }

            const article = document.createElement("article");
            article.className = "border-2 border-unicafe-card-border rounded-[10px] p-3 bg-white shadow-sm flex items-center gap-3";
            
            article.innerHTML = `
                <div class="${contenedorAvatarClases}">
                    ${avatarHTML}
                </div>
                <div class="flex-1 min-w-0">
                    <strong class="text-sm block truncate text-[#333]">${nombre}</strong>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded border border-unicafe-price-border font-bold text-[13px] text-[#333]">$${precio}</span>
                </div>
                <button onclick="verDetalle(${id})" class="shrink-0 px-4 py-5 rounded-md text-[10px] font-black bg-unicafe-btn-ver text-unicafe-text-ver uppercase hover:opacity-80 transition-all shadow-sm leading-tight cursor-pointer">
                    VER<br>DETALLE
                </button>
            `;
            
            divArticulos.appendChild(article);
        });

        section.appendChild(divArticulos);
        contenedorMenu.appendChild(section);
    });
};

const modalDetalle = document.getElementById('modalDetalle');
const modalCaja = document.getElementById('modalCaja');

window.verDetalle = (idPlatillo) => {
    platilloSeleccionado = platillosGlobal.find(p => Number(p.id || p.intIdPlatillo) === idPlatillo);
    if (!platilloSeleccionado) return;

    const idCat = Number(platilloSeleccionado.idCategoria || platilloSeleccionado.intIdCategoria);
    const categoriaObj = categoriasGlobal.find(c => Number(c.id || c.intIdCategoria) === idCat);
    const nombreCategoria = categoriaObj ? (categoriaObj.nombre || categoriaObj.vchCategoria) : "General";

    cantidadActual = 1;
    actualizarPrecioModal();

    document.getElementById('modalNombre').textContent = platilloSeleccionado.nombre || platilloSeleccionado.vchNombre;
    document.getElementById('modalCategoria').textContent = nombreCategoria;

    const imagenUrl = platilloSeleccionado.imagen || platilloSeleccionado.vchImagen;
    const contImagen = document.getElementById('modalImagenContenedor');
    if (imagenUrl) {
        contImagen.innerHTML = `<img src="${imagenUrl}" class="w-full h-full object-cover" alt="Platillo">`;
    } else {
        const inicial = (platilloSeleccionado.nombre || platilloSeleccionado.vchNombre).charAt(0).toUpperCase();
        contImagen.innerHTML = `<div class="text-unicafe-avatar-text font-bold text-5xl">${inicial}</div>`;
    }

    modalDetalle.classList.remove('hidden');
    setTimeout(() => {
        modalDetalle.classList.remove('opacity-0');
        modalCaja.classList.remove('scale-95');
    }, 10);
};

window.cerrarModal = () => {
    modalDetalle.classList.add('opacity-0');
    modalCaja.classList.add('scale-95');

    setTimeout(() => {
        modalDetalle.classList.add('hidden');
        platilloSeleccionado = null;
    }, 300);
};

modalDetalle.addEventListener('click', (e) => {
    if (e.target === modalDetalle) window.cerrarModal();
});

window.cambiarCantidad = (cambio) => {
    const nuevaCantidad = cantidadActual + cambio;
    if (nuevaCantidad >= 1 && nuevaCantidad <= 20) {
        cantidadActual = nuevaCantidad;
        actualizarPrecioModal();
    }
};

const actualizarPrecioModal = () => {
    const precioBase = Number(platilloSeleccionado.precio || platilloSeleccionado.decPrecio);
    const total = precioBase * cantidadActual;

    document.getElementById('modalCantidad').textContent = cantidadActual;
    document.getElementById('modalPrecio').textContent = `$${precioBase.toFixed(2)}`;
    document.getElementById('modalTotalBtn').textContent = `$${total.toFixed(2)}`;
};

document.getElementById('btnAgregarCarrito').addEventListener('click', () => {
    const total = (Number(platilloSeleccionado.precio || platilloSeleccionado.decPrecio) * cantidadActual).toFixed(2);
    const nombre = platilloSeleccionado.nombre || platilloSeleccionado.vchNombre;

    alert(`¡Has agregado ${cantidadActual}x ${nombre} a tu pedido!\nTotal de este platillo: $${total}`);
    window.cerrarModal();
});

cargarMenuPublico();