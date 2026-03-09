const modal = document.getElementById('productModal');

const cargarProductos = (url) => {
    const urlFinal = url;

    fetch(urlFinal)
        .then(res => res.json())
        .then(data => {

            mostrarProductos(data);
        })
        .catch(error => console.error("Error al cargar productos:", error));
};

const mostrarProductos = (productos) => {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; width:100%; color: white;'>No hay productos para mostrar en esta página.</p>";
        return;
    }

    productos.forEach(p => {
        const imagenUrl = p.vchImagen ? p.vchImagen : 'assets/placeholder.jpg';
        const descripcion = p.vchDescripcion ? p.vchDescripcion : 'Sin descripción disponible';
        const precioFormateado = Number(p.decPrecioVenta).toFixed(2);

        const tarjeta = document.createElement("article");

        tarjeta.className = "group bg-white border border-unicafe-border rounded-[8px] p-3 flex items-center cursor-pointer hover:shadow-unicafe transition-all";

        tarjeta.setAttribute(
            "onclick",
            `abrirModal('${p.vchNombre}', '${descripcion}', '$${precioFormateado} MXN', '${p.intStock}', '${imagenUrl}')`
        );

        tarjeta.innerHTML = `
            <div class="relative w-[100px] h-[100px] shrink-0 bg-[#f5f5f5] rounded-md overflow-hidden flex items-center justify-center border border-unicafe-avatar-border">
                <img src="${imagenUrl}" alt="${p.vchNombre}" class="w-full h-full object-contain p-1">

                <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span class="text-[22px] drop-shadow-md">🔍</span>
                    <span class="text-white font-black text-[15px] text-center leading-tight drop-shadow-md mt-1">
                        Ver<br>Detalle
                    </span>
                </div>
            </div>

            <div class="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                <h3 class="font-bold text-[16px] text-[#1f1f1f] truncate">${p.vchNombre}</h3>
                <p class="text-[13px] text-[#666] truncate mt-1">${descripcion}</p>
                <p class="font-bold text-[15px] text-[#1f1f1f] mt-2">$${precioFormateado} MXN</p>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}

const abrirModal = (titulo, descripcion, precio, stock, imagenUrl) => {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalDesc').textContent = descripcion;
    document.getElementById('modalPrice').textContent = precio;
    document.getElementById('modalImg').src = imagenUrl;

    const elementoStock = document.getElementById('modalStock');
    
    const cantidadStock = parseInt(stock);
    
    if (cantidadStock > 0) {
        elementoStock.textContent = `Disponibles: ${cantidadStock} unidades`;
        elementoStock.className = "text-green-600 font-semibold text-sm mb-6";
    } else {
        elementoStock.textContent = "Agotado por el momento";
        elementoStock.className = "text-red-500 font-bold text-sm mb-6";
    }

    const modal = document.getElementById('productModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};
modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
        cerrarModal();
    }
});
const cerrarModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

cargarProductos("https://unicafe-api.vercel.app/api/productos");