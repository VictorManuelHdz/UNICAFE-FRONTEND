// ==========================================
// MÓDULO PÚBLICO: AVISO DE PRIVACIDAD
// ==========================================

const cargarAviso = async () => {
    const contenedor = document.getElementById('contenedorAviso');
    const fechaContenedor = document.getElementById('fechaActualizacion');

    if (!contenedor) return;

    try {
        // Llamamos a tu API de avisos
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/aviso');

        if (!respuesta.ok) throw new Error("Error al conectar con el servidor");

        const datos = await respuesta.json();

        // Si no hay datos en la BD
        if (datos.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-gray-500 font-bold py-10">El aviso de privacidad no está disponible en este momento.</p>';
            fechaContenedor.textContent = '';
            return;
        }

        // ... (todo lo de arriba queda igual) ...
        const aviso = datos.find(d => d.clave === 'aviso_privacidad') || datos[0];
        const contenido = aviso.contenido || '';

        if (aviso.ultima_actualizacion) {
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
            const fechaBonita = new Date(aviso.ultima_actualizacion).toLocaleDateString('es-MX', opcionesFecha);
            fechaContenedor.textContent = `Última actualización: ${fechaBonita}`;
        } else {
            fechaContenedor.textContent = '';
        }

        // ¡COMO SUMMERNOTE YA GENERA HTML, SOLO LO INYECTAMOS DIRECTO!
        contenedor.innerHTML = contenido;

    } catch (error) {
        console.error("Error al cargar el aviso de privacidad:", error);
        contenedor.innerHTML = '<p class="text-center text-red-500 font-bold py-10">Hubo un problema al cargar la información.</p>';
        fechaContenedor.textContent = '';
    }
};

// Arrancar la aplicación
cargarAviso();