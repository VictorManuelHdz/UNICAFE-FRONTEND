// ==========================================
// MÓDULO PÚBLICO: TÉRMINOS Y CONDICIONES (DISEÑO TARJETAS)
// ==========================================

const cargarTerminos = async () => {
    const contenedor = document.getElementById('contenedorTerminos');
    if (!contenedor) return;

    try {
        // Llamamos a tu API de términos
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/terminos');
        
        if (!respuesta.ok) throw new Error("Error al conectar con el servidor");
        
        const datos = await respuesta.json();

        // Si la base de datos está vacía
        if (datos.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-gray-500 font-bold py-10">No hay términos y condiciones disponibles en este momento.</p>';
            return;
        }

        // Generamos el HTML con el diseño de Tarjetas con Borde Izquierdo
        const htmlTerminos = datos.map((termino) => {
            const titulo = termino.titulo || 'Sin título';
            const contenido = termino.contenido || '';
            
            return `
                <div class="bg-white rounded-lg shadow-sm p-6 md:p-8 border-l-[6px] border-unicafe-botones transition-shadow hover:shadow-md">
                    <h3 class="font-black text-[#1f1f1f] text-lg md:text-xl mb-3 uppercase">
                        ${titulo}
                    </h3>
                    <p class="text-gray-700 text-[1rem] leading-relaxed text-justify">
                        ${contenido}
                    </p>
                </div>
            `;
        }).join(''); // Ya no usamos la línea gris de separación, el gap-6 del padre hace el espacio

        // Inyectamos todo el bloque generado al contenedor
        contenedor.innerHTML = htmlTerminos;

    } catch (error) {
        console.error("Error al cargar los términos:", error);
        contenedor.innerHTML = '<p class="text-center text-red-500 font-bold py-10">Hubo un problema al cargar la información legal.</p>';
    }
};

// Arrancamos la aplicación
cargarTerminos();