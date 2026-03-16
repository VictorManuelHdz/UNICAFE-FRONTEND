const formAviso = document.getElementById('formAviso');
const btnGuardar = document.getElementById('btnGuardarAviso');
const alerta = document.getElementById('alerta');

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
        $('#summernote').summernote('code', '<p class="text-red-500">Error al cargar la información.</p>');
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

            alerta.classList.remove("hidden");
            setTimeout(() => alerta.classList.add("hidden"), 3000);

        } catch (error) {
            console.error(error);
            alert("No se pudo guardar el aviso. " + error.message);
        } finally {
            btnGuardar.textContent = "Guardar Cambios";
            btnGuardar.disabled = false;
        }
    });
}

$(document).ready(function() {
    
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