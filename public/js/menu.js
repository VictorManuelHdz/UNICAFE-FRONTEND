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

// --- 2. RENDERIZADO VISUAL ---
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

        const section = document.createElement("section");
        section.className = "w-full bg-white border-2 border-unicafe-border rounded-[15px] p-5 md:p-8 shadow-sm transition-all hover:shadow-md";

        section.innerHTML = `
            <h3 class="text-2xl md:text-3xl font-black mb-6 text-unicafe-header-dark border-b-2 border-[#e6d8c3] pb-3 uppercase tracking-wide">
                ${nombreCat}
            </h3>
        `;

        const divArticulos = document.createElement("div");
        divArticulos.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10";

        platillosDeCat.forEach(p => {
            const id = p.id || p.intIdPlatillo;
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            let avatarHTML = '';
            let contenedorAvatarClases = "w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] shrink-0 rounded-lg overflow-hidden border border-unicafe-avatar-border bg-[#eee] flex items-center justify-center text-unicafe-avatar-text font-bold text-3xl";

            if (imagenUrl) {
                avatarHTML = `<img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">`;
            } else {
                const inicial = nombre.charAt(0).toUpperCase();
                contenedorAvatarClases = "w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] shrink-0 rounded-lg overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-3xl flex items-center justify-center";
                avatarHTML = inicial;
            }

            const article = document.createElement("article");
            // 🌟 Aumentamos un poco el padding horizontal (px-4 md:px-6) para alargarla visualmente
            article.className = "group border-2 border-unicafe-card-border rounded-[12px] py-4 px-4 md:px-6 bg-white shadow-sm flex items-center gap-4 md:gap-6 hover:shadow-md transition-shadow";
            
            article.innerHTML = `
                <div class="${contenedorAvatarClases}">
                    ${avatarHTML}
                </div>
                <div class="flex-1 min-w-0 py-1 flex flex-col justify-center">
                    <strong class="text-[17px] sm:text-[19px] block text-[#333] leading-tight mb-2.5 line-clamp-2">${nombre}</strong>
                    <span class="inline-block px-4 py-1.5 w-max rounded-md border border-unicafe-price-border bg-gray-50 font-black text-[14px] sm:text-[15px] text-unicafe-botones shadow-sm">$${precio}</span>
                </div>
                <button onclick="verDetalle(${id})" class="shrink-0 px-5 md:px-6 py-8 md:py-9 rounded-lg text-[11px] md:text-[12px] font-black bg-unicafe-btn-ver text-unicafe-text-ver uppercase hover:opacity-80 transition-all shadow-sm leading-tight cursor-pointer active:scale-95">
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