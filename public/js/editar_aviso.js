const formAviso = document.getElementById('formAviso');
const btnGuardar = document.getElementById('btnGuardarAviso');
const alerta = document.getElementById('alerta');

const mostrarToast = (mensaje, tipo = 'exito') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold mb-3';


    if (tipo === 'exito') {
        toast.classList.add('bg-unicafe-botones');
        toast.innerHTML = `<span class="text-2xl">✅</span><span>${mensaje}</span>`;
    } else {
        toast.classList.add('bg-unicafe-cancel');
        toast.innerHTML = `<span class="text-2xl">⚠️</span><span>${mensaje}</span>`;
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

let avisoIdActual = null;

const cargarAvisoEditor = async () => {
    try {
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/aviso');
        if (!respuesta.ok) throw new Error("Error de conexión");

        const datos = await respuesta.json();

        if (datos.length > 0) {
            const aviso = datos.find(d => d.clave === 'aviso_privacidad') || datos[0];
            avisoIdActual = aviso.id;

            // Inyectamos el HTML de la base de datos al editor
            $('#summernote').summernote('code', aviso.contenido);
        }
    } catch (error) {
        console.error("Error al cargar:", error);
        mostrarToast('No se pudo cargar el Aviso de Privacidad actual.', 'error');
    }
};

if (formAviso) {
    formAviso.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoContenido = $('#summernote').summernote('code').trim();

        if (!nuevoContenido || nuevoContenido === '<p><br></p>') {
            alert("El aviso no puede estar vacío");
            return;
        }

        try {
            btnGuardar.textContent = "Guardando...";
            btnGuardar.disabled = true;

            const token = localStorage.getItem('token');
            let url = 'https://unicafe-api.vercel.app/api/aviso';
            let metodo = 'POST';

            if (avisoIdActual) {
                url = `${url}/${avisoIdActual}`;
                metodo = 'PUT';
            }

            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clave: 'aviso_privacidad',
                    contenido: nuevoContenido
                })
            });

            if (!respuesta.ok) throw new Error("Error al guardar en la base de datos");

            mostrarToast('Aviso de Privacidad actualizado correctamente.', 'exito');
            setTimeout(() => alerta.classList.add("hidden"), 3000);

        } catch (error) {
            console.error(error);
            mostrarToast('Hubo un problema al guardar los cambios.', 'error');
        } finally {
            btnGuardar.textContent = "Guardar Cambios";
            btnGuardar.disabled = false;
        }
    });
}

$(document).ready(function () {

    // Primero, inicializamos el editor visual
    $('#summernote').summernote({
        height: 350,
        placeholder: 'Cargando información o escriba aquí el aviso...',
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'table']],
            ['view', ['fullscreen', 'codeview']]
        ]
    });

    // Una vez que el editor existe, descargamos y pegamos los datos de la BD
    cargarAvisoEditor();
});