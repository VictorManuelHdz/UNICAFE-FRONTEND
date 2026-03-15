const cargarInformacionSomos = async () => {
    const contenedor = document.getElementById('contenedorInfoSomos');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/somos');
        
        if (!respuesta.ok) throw new Error("Error al conectar con el servidor");
        
        const datos = await respuesta.json();

        if (datos.length === 0) {
            contenedor.innerHTML = `
                <div class="w-full text-center py-10">
                    <p class="text-xl text-gray-500 font-bold">Pronto agregaremos más información sobre nosotros.</p>
                </div>`;
            return;
        }

        const info = datos[0];
        
        const imagenUrl = info.imagen || "https://placehold.co/600x400/EFE4D2/8C6844?text=Unicafe";
        const descripcionBruta = info.descripcion || "Bienvenidos a nuestra cafetería.";

        const parrafos = descripcionBruta.split('\n')
            .filter(texto => texto.trim() !== '') 
            .map((texto, index) => {
                if (index === 0) {
                    return `<p class="text-xl md:text-2xl font-bold leading-snug text-unicafe-header-dark mb-4">${texto}</p>`;
                }
                return `<p class="text-lg leading-relaxed text-gray-700 mb-4">${texto}</p>`;
            }).join('');

        contenedor.innerHTML = `
            <div class="w-full md:w-1/2">
                <img src="${imagenUrl}" alt="Instalaciones Unicafe" class="w-full rounded-xl shadow-md border border-unicafe-border object-cover">
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-center">
                ${parrafos}
            </div>
        `;

    } catch (error) {
        console.error("Error al cargar sección Somos:", error);
        contenedor.innerHTML = `
            <div class="w-full text-center py-10">
                <p class="text-red-500 font-bold">No pudimos cargar la información en este momento.</p>
            </div>`;
    }
};

cargarInformacionSomos();