// ==========================================
// MÓDULO PÚBLICO: INICIO (HOME - DISEÑO ORIGINAL)
// ==========================================

const contenedorMenu = document.getElementById('contenedorMenuInicio');
const contenedorProductos = document.getElementById('contenedorProductosInicio');

// --- 1. CARGAR MENÚ DEL DÍA ---
const cargarMenuDestacado = async () => {
    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/menu');
        if (!respuesta.ok) throw new Error("Error de conexión");

        const platillos = await respuesta.json();

        if (platillos.length === 0) {
            contenedorMenu.innerHTML = '<p class="col-span-full text-center text-stone-500">El menú del día aún no está disponible.</p>';
            return;
        }

        // Tomamos 4 platillos
        const destacados = platillos.slice(0, 4);
        contenedorMenu.innerHTML = '';

        destacados.forEach(p => {
            const nombre = p.nombre || p.vchNombre;
            const precio = Number(p.precio || p.decPrecio).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            // ESTILO ORIGINAL DE PLATILLO
            const article = document.createElement("a");
            article.href = "public/menu.html";
            article.className = "group flex flex-col items-center text-center";

            let imgHTML = imagenUrl
                ? `<img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover rounded-lg">`
                : `<span class="text-4xl font-bold text-stone-600">${nombre.charAt(0).toUpperCase()}</span>`;

            // Respetamos tu div "mini__img" y la caja de color #e9dfce
            article.innerHTML = `
                <div class="mini__img flex justify-center w-full">
                  <div class="mb-4 flex size-28 items-center justify-center overflow-hidden rounded-lg bg-[#e9dfce] group-hover:bg-stone-200 transition-colors">
                    ${imgHTML}
                  </div>
                </div>
                <h3 class="text-xl font-bold text-stone-900 leading-tight">${nombre}</h3>
                <p class="mt-1 text-lg font-semibold text-stone-800">$${precio}</p>
            `;
            contenedorMenu.appendChild(article);
        });

    } catch (error) {
        console.error("Error al cargar menú:", error);
        contenedorMenu.innerHTML = '<p class="col-span-full text-center text-red-500">Error al cargar el menú.</p>';
    }
};

// --- 2. CARGAR PRODUCTOS DISPONIBLES ---
const cargarProductosDestacados = async () => {
    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/productos');
        if (!respuesta.ok) throw new Error("Error de conexión");

        const productos = await respuesta.json();

        if (productos.length === 0) {
            contenedorProductos.innerHTML = '<p class="w-full text-center text-stone-500">La tienda está vacía por ahora.</p>';
            return;
        }

        // Tomamos 4 productos
        const destacados = productos.slice(0, 4);
        contenedorProductos.innerHTML = '';

        destacados.forEach(p => {
            const nombre = p.nombre || p.vchNombre;
            const descripcion = p.descripcion || p.vchDescripcion || "Disponible en cafetería.";
            const precio = Number(p.precioVenta || p.decPrecioVenta).toFixed(2);
            const imagenUrl = p.imagen || p.vchImagen;

            // ESTILO ORIGINAL DE PRODUCTO
            const article = document.createElement("a");
            article.href = "public/productos.html";
            article.className = "w-56 overflow-hidden rounded-lg border border-stone-300 bg-white p-5 shadow-sm transition-transform hover:scale-105";

            let imgHTML = imagenUrl
                ? `<img src="${imagenUrl}" alt="${nombre}" class="w-full h-full object-cover">`
                : `<span class="text-5xl font-bold text-stone-300">${nombre.charAt(0).toUpperCase()}</span>`;

            // Respetamos tu contenedor cuadrado "aspect-square" y colores
            article.innerHTML = `
                <div class="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-stone-100">
                  ${imgHTML}
                </div>
                <div class="text-center">
                  <h3 class="text-xl font-extrabold text-stone-900 truncate">${nombre}</h3>
                  <p class="mt-2 text-sm leading-tight text-stone-500 line-clamp-2">${descripcion}</p>
                  <p class="mt-4 text-xl font-bold text-stone-800">$${precio}</p>
                </div>
            `;
            contenedorProductos.appendChild(article);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorProductos.innerHTML = '<p class="w-full text-center text-red-500">Error al cargar los productos.</p>';
    }
};

// Arrancamos
cargarMenuDestacado();
cargarProductosDestacados();