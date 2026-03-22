const contenedorMenu = document.getElementById('menuPublicoContenedor');
const mensajeCarga = document.getElementById('mensajeCarga');

let categoriasGlobal = [];
let platillosGlobal = [];
let platilloSeleccionado = null;

const cargarMenuPublico = async () => {
    try {
        const [resCategorias, resPlatillos] = await Promise.all([
            fetch("https://unicafe-api.vercel.app/api/categorias-menu"),
            fetch("https://unicafe-api.vercel.app/api/menu")
        ]);

        if (!resCategorias.ok || !resPlatillos.ok) throw new Error("Error en la conexión");

        categoriasGlobal = await resCategorias.json();
        platillosGlobal = await resPlatillos.json();

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
        section.className = "flex flex-col bg-white border-2 border-unicafe-border rounded-lg p-[14px] shadow-sm transition-all hover:shadow-md h-full";
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

            const hoverOverlay = `
                <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span class="text-[14px] drop-shadow-md">🔍</span>
                    <span class="text-white font-black text-[9px] text-center leading-tight drop-shadow-md mt-0.5">Ver<br>Detalle</span>
                </div>`;

            if (imagenUrl && imagenUrl.trim() !== '') {
                avatarHTML = `
                <div class="relative group cursor-pointer w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#eee] flex items-center justify-center" onclick="verDetalle(${id})">
                    <img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover" onerror="reemplazarImagenRotaMenu(this, '${inicial}')">
                    ${hoverOverlay}
                </div>`;
            } else {
                avatarHTML = `
                <div class="relative group cursor-pointer w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-xl flex items-center justify-center" onclick="verDetalle(${id})">
                    ${inicial}
                    ${hoverOverlay}
                </div>`;
            }

            const article = document.createElement("article");
            article.className = "border-2 border-unicafe-card-border rounded-[10px] p-3 bg-white shadow-sm flex items-center gap-3";

            article.innerHTML = `
                ${avatarHTML}
                <div class="flex-1 min-w-0">
                    <strong class="text-sm block truncate text-[#333]">${nombre}</strong>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded border border-unicafe-price-border font-bold text-[13px] text-[#333]">$${precio}</span>
                </div>
                <button onclick="agregar(${id})" 
                    class="flex items-center justify-center w-10 h-10 min-w-[40px] rounded-full bg-[#ccab4f] text-white transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer border-2 border-[#c0ab71] ml-2">
                    <span class="text-3xl font-light leading-none pt-0.5" style="font-family: Arial, sans-serif;">+</span>
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

    document.getElementById('modalNombre').textContent = platilloSeleccionado.nombre || platilloSeleccionado.vchNombre;
    document.getElementById('modalCategoria').textContent = nombreCategoria;

    const precioBase = Number(platilloSeleccionado.precio || platilloSeleccionado.decPrecio);
    document.getElementById('modalPrecio').textContent = `$${precioBase.toFixed(2)}`;

    const imagenUrl = platilloSeleccionado.imagen || platilloSeleccionado.vchImagen;
    const contImagen = document.getElementById('modalImagenContenedor');
    const inicial = (platilloSeleccionado.nombre || platilloSeleccionado.vchNombre).charAt(0).toUpperCase();

    if (imagenUrl && imagenUrl.trim() !== '') {
        contImagen.innerHTML = `<img src="${imagenUrl}" class="max-w-full max-h-[400px] object-contain" alt="Platillo" onerror="reemplazarImagenModalMenu(this, '${inicial}')">`;
    } else {
        contImagen.innerHTML = `<div class="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-full bg-unicafe-body text-unicafe-avatar-text font-black text-6xl md:text-8xl shadow-inner border-4 border-white">${inicial}</div>`;
    }

    modalDetalle.classList.remove('hidden');
    modalDetalle.classList.add('flex');

    setTimeout(() => {
        modalCaja.classList.remove('opacity-0');
        modalCaja.classList.remove('scale-95');
    }, 10);
};

window.cerrarModal = () => {
    modalCaja.classList.add('opacity-0');
    modalCaja.classList.add('scale-95');

    setTimeout(() => {
        modalDetalle.classList.add('hidden');
        modalDetalle.classList.remove('flex');
        platilloSeleccionado = null;
    }, 300);
};

modalDetalle.addEventListener('click', (e) => {
    if (e.target === modalDetalle) window.cerrarModal();
});

const agregar = (id) => {
    const p = platillosGlobal.find(item => (item.id || item.intIdPlatillo) == id);
    if (p) {
        if (typeof Carrito !== 'undefined') {
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio);
            const img = (p.imagen || p.vchImagen) ? (p.imagen || p.vchImagen) : 'assets/placeholder.jpg';

            const idReal = p.id || p.intIdPlatillo;
            Carrito.agregar(idReal, 'platillo', nombre, precio, img);
        } else {
            console.error("Carrito no definido");
        }
    }
};
window.agregar = agregar;

cargarMenuPublico();

window.reemplazarImagenRotaMenu = (imgElement, inicial) => {
    const contenedorPadre = imgElement.parentElement;

    contenedorPadre.className = "w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden border border-unicafe-avatar-border bg-[#efe3cf] text-unicafe-avatar-text font-bold text-xl flex items-center justify-center";

    contenedorPadre.innerHTML = inicial;
};

window.reemplazarImagenModalMenu = (imgElement, inicial) => {
    const div = document.createElement('div');
    div.className = "w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-full bg-unicafe-body text-unicafe-avatar-text font-black text-6xl md:text-8xl shadow-inner border-4 border-white";
    div.textContent = inicial;
    imgElement.replaceWith(div);
};