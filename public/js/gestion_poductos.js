// ==========================================
// MÓDULO DE GESTIÓN DE PRODUCTOS (INVENTARIO)
// ==========================================

// --- ELEMENTOS DEL DOM ---
const btnFormulario = document.getElementById('btnMostrarFormularioProductos');
const formContainer = document.getElementById('formularioProducto');
const listContainer = document.getElementById('listadoProductos');
const formProducto = document.querySelector('form');

// Tablas
const tbodyInventario = document.querySelectorAll('tbody')[0];
const tbodyUrgente = document.querySelectorAll('tbody')[1];
const contenedorEstadisticas = document.querySelector('#estadisticasProductos div');

// Inputs del formulario
const inputNombre = document.getElementById('inputNombre');
const inputDescripcion = document.getElementById('inputDescripcion');
const selectCategoria = document.getElementById('selectCategoria');
const inputStock = document.getElementById('inputStock');
const inputPrecioCompra = document.getElementById('inputPrecioCompra');
const inputPrecioVenta = document.getElementById('inputPrecioVenta');
const selectProveedor = document.getElementById('selectProveedor');

// Inputs de Imagen
const inputImagen = document.getElementById('inputArchivoImagen');
const imgPrevia = document.getElementById('imgPreview');
const msgErrorImagen = document.getElementById('msgErrorImagen');

// --- ESTADO GLOBAL ---
let productoEditandoId = null;
let imagenActualUrl = null;
let categoriasGlobal = [];
let proveedoresGlobal = [];
let productosGlobal = [];

// ==========================================
// 1. CARGA DE DATOS (API)
// ==========================================
const cargarDatosBase = async () => {
    try {
        // Obtenemos productos, categorías y proveedores al mismo tiempo
        const [resProd, resCat, resProv] = await Promise.all([
            fetch("https://unicafe-api.vercel.app/api/productos"),
            fetch("https://unicafe-api.vercel.app/api/categorias"),
            fetch("https://unicafe-api.vercel.app/api/proveedores").catch(() => ({ ok: false })) // Prevenimos error si no existe aún
        ]);

        if (!resProd.ok) throw new Error("Error al cargar productos");

        const productos = await resProd.json();
        productosGlobal = productos;

        if (resCat.ok) {
            categoriasGlobal = await resCat.json();
            llenarSelectCategorias();
        }

        // Si tienes el endpoint de proveedores, lo llenamos. Si no, dejamos los de prueba.
        if (resProv.ok) {
            proveedoresGlobal = await resProv.json();
            llenarSelectProveedores();
        }

        renderizarTablas(productos);
        renderizarEstadisticas(productos);

    } catch (error) {
        console.error("Error al cargar datos:", error);
        tbodyInventario.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500 font-bold">Error al cargar el inventario.</td></tr>`;
    }
};

const llenarSelectCategorias = () => {
    // Llenamos el del formulario
    selectCategoria.innerHTML = '<option value="">Seleccionar...</option>';
    // Llenamos el de la tabla (si existe)
    if (filtroCategoriaTabla) filtroCategoriaTabla.innerHTML = '<option value="todos">Todas las categorías</option>';

    categoriasGlobal.forEach(cat => {
        const idCat = cat.id || cat.intIdCategoria;
        const nombreCat = cat.nombre || cat.vchCategoria;

        selectCategoria.innerHTML += `<option value="${idCat}">${nombreCat}</option>`;
        if (filtroCategoriaTabla) filtroCategoriaTabla.innerHTML += `<option value="${idCat}">${nombreCat}</option>`;
    });
};

if (filtroCategoriaTabla) {
    filtroCategoriaTabla.addEventListener('change', (e) => {
        const idCatSeleccionada = e.target.value;

        if (idCatSeleccionada === 'todos') {
            // Si eligen "todos", mostramos el arreglo completo original
            renderizarTablas(productosGlobal);
        } else {
            // Filtramos el arreglo buscando los que coincidan con la categoría
            const productosFiltrados = productosGlobal.filter(p => 
                String(p.idCategoria || p.intIdCategoria) === String(idCatSeleccionada)
            );
            // Volvemos a dibujar la tabla pero solo con los filtrados
            renderizarTablas(productosFiltrados);
        }
    });
}

const llenarSelectProveedores = () => {
    selectProveedor.innerHTML = '<option value="">Seleccionar...</option>';
    proveedoresGlobal.forEach(prov => {
        // Ajusta estos nombres de propiedades según tu tabla de proveedores reales
        const rfc = prov.rfc || prov.vchRFCProveedor || prov.id;
        const nombre = prov.nombre || prov.vchNombreEmpresa || prov.rfc;
        selectProveedor.innerHTML += `<option value="${rfc}">${nombre}</option>`;
    });
};

// ==========================================
// 2. RENDERIZADO DE TABLAS Y GRÁFICAS
// ==========================================
const renderizarTablas = (productos) => {
    tbodyInventario.innerHTML = '';
    tbodyUrgente.innerHTML = '';

    let productosUrgentes = 0;

    productos.forEach(p => {
        const id = p.id || p.intIdProducto;
        const nombre = p.nombre || p.vchNombre;
        const stock = Number(p.stock || p.intStock);
        const pVenta = Number(p.precioVenta || p.decPrecioVenta).toFixed(2);
        const imagenUrl = p.imagen || p.vchImagen || "https://placehold.co/50x50?text=IMG";
        const rfc = p.rfcProveedor || p.vchRFCProveedor || 'N/A';

        // Buscamos el nombre de la categoría
        const idCat = p.idCategoria || p.intIdCategoria;
        const catObj = categoriasGlobal.find(c => (c.id || c.intIdCategoria) == idCat);
        const nombreCategoria = catObj ? (catObj.nombre || catObj.vchCategoria) : 'Sin categoría';

        // Estilos condicionales para el stock
        let stockClass = "font-bold text-[#333]";
        if (stock === 0) stockClass = "font-bold text-red-600";
        else if (stock <= 5) stockClass = "font-bold text-orange-500";
        else if (stock > 20) stockClass = "font-bold text-green-600";

        // 1. Fila de la Tabla General
        const trGeneral = document.createElement("tr");
        trGeneral.className = "block md:table-row mb-4 md:mb-0 bg-white border border-gray-200 rounded-lg shadow-sm md:border-none md:shadow-none hover:bg-gray-50";
        trGeneral.innerHTML = `
            <td data-label="ID" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-unicafe-botones md:before:hidden align-middle">
                ${id}
            </td>
            <td data-label="Imagen" class="block md:table-cell text-center md:text-left pl-2.5 md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 md:before:hidden align-middle bg-gray-50 md:bg-transparent">
                <img src="${imagenUrl}" alt="img" class="w-[50px] h-[50px] object-cover rounded border border-gray-300 inline-block">
            </td>
            <td data-label="Producto" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-unicafe-botones md:before:hidden align-middle">
                ${nombre}
            </td>
            <td data-label="Categoría" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-unicafe-botones md:before:hidden align-middle">
                ${nombreCategoria}
            </td>
            <td data-label="Stock" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-unicafe-botones md:before:hidden align-middle ${stockClass}">
                ${stock}
            </td>
            <td data-label="P. Venta" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-gray-100 md:border md:border-gray-300 p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-unicafe-botones md:before:hidden align-middle">
                $${pVenta}
            </td>
            <td data-label="Acciones" class="block md:table-cell text-center relative md:border md:border-gray-300 p-3 md:p-2.5 md:before:hidden align-middle bg-[#fdfbf7] md:bg-transparent">
                <button onclick="prepararEdicion(${id})" class="text-[#007bff] font-bold mr-3 hover:underline cursor-pointer"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                <button onclick="eliminarProducto(${id})" class="text-[#dc3545] font-bold hover:underline cursor-pointer"><i class="fa-solid fa-trash"></i> Eliminar</button>
            </td>
        `;
        tbodyInventario.appendChild(trGeneral);

        // 2. Fila de la Tabla Urgente (Si el stock es <= 2)
        if (stock <= 2) {
            productosUrgentes++;
            const trUrgente = document.createElement("tr");
            trUrgente.className = "block md:table-row mb-4 md:mb-0 bg-white border border-[#f5c6cb] rounded-lg shadow-sm md:border-none md:shadow-none hover:bg-red-50";

            let estadoPill = stock === 0
                ? '<span class="text-white font-bold bg-red-600 px-2 py-1 rounded text-xs">AGOTADO</span>'
                : '<span class="text-[#856404] font-bold bg-[#fff3cd] px-2 py-1 rounded text-xs border border-[#ffeeba]">POR AGOTARSE</span>';

            trUrgente.innerHTML = `
                <td data-label="Producto" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-[#f5c6cb] md:border p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-[#a71d2a] md:before:hidden align-middle font-bold">
                    ${nombre}
                </td>
                <td data-label="Stock" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-[#f5c6cb] md:border p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-[#a71d2a] md:before:hidden align-middle font-black text-red-600">
                    ${stock}
                </td>
                <td data-label="RFC" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative border-b border-[#f5c6cb] md:border p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-[#a71d2a] md:before:hidden align-middle text-sm">
                    ${rfc}
                </td>
                <td data-label="Estado" class="block md:table-cell text-right md:text-left pl-[45%] md:pl-2.5 relative md:border border-[#f5c6cb] p-2.5 before:content-[attr(data-label)] before:absolute before:left-4 before:w-[40%] before:text-left before:font-bold before:text-[#a71d2a] md:before:hidden align-middle">
                    ${estadoPill}
                </td>
            `;
            tbodyUrgente.appendChild(trUrgente);
        }
    });

    // Actualizamos el banner de alerta
    const bannerAlerta = document.querySelector('.bg-\\[\\#fff3cd\\]');
    if (bannerAlerta) {
        if (productosUrgentes > 0) {
            bannerAlerta.innerHTML = `<strong>⚠️ ATENCIÓN:</strong> Tienes ${productosUrgentes} producto(s) agotado(s) o por agotarse.`;
            bannerAlerta.style.display = 'block';
            document.querySelector('.bg-\\[\\#fdf9f0\\]').style.display = 'block'; // Muestra la tabla de urgentes
        } else {
            bannerAlerta.style.display = 'none';
            document.querySelector('.bg-\\[\\#fdf9f0\\]').style.display = 'none'; // Oculta la tabla si todo está bien
        }
    }
};

const renderizarEstadisticas = (productos) => {
    contenedorEstadisticas.innerHTML = '';
    const statsContainerParent = document.getElementById('estadisticasProductos');

    if (productos.length === 0) {
        statsContainerParent.classList.add('hidden');
        return;
    }

    statsContainerParent.classList.remove('hidden');

    categoriasGlobal.forEach(cat => {
        const idCat = Number(cat.id || cat.intIdCategoria);
        const nombreCat = cat.nombre || cat.vchCategoria;

        // Sumamos el stock de todos los productos de esta categoría
        const platillosDeCat = productos.filter(p => Number(p.idCategoria || p.intIdCategoria) === idCat);
        const totalStockCat = platillosDeCat.reduce((acc, p) => acc + Number(p.stock || p.intStock), 0);

        if (platillosDeCat.length > 0) {
            contenedorEstadisticas.innerHTML += `
                <div class="bg-white p-4 rounded-xl border border-unicafe-border shadow-sm flex flex-col gap-2">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-unicafe-header-dark text-sm">${nombreCat}</span>
                        <span class="text-xs font-black text-unicafe-botones">${totalStockCat} unidades</span>
                    </div>
                </div>
            `;
        }
    });
};

// ==========================================
// 3. LÓGICA DE FORMULARIO E IMAGEN
// ==========================================
window.toggleFormulario = () => {
    if (formContainer.classList.contains('hidden')) {
        formContainer.classList.remove('hidden');
        listContainer.classList.add('hidden');
        if (document.getElementById('estadisticasProductos')) document.getElementById('estadisticasProductos').classList.add('hidden');
        btnFormulario.textContent = 'Ocultar Formulario';
    } else {
        formContainer.classList.add('hidden');
        listContainer.classList.remove('hidden');
        if (document.getElementById('estadisticasProductos')) document.getElementById('estadisticasProductos').classList.remove('hidden');
        btnFormulario.textContent = 'Agregar Nuevo Producto';

        if (formProducto) {
            formProducto.reset();
            productoEditandoId = null;
            imagenActualUrl = null;
            document.getElementById('tituloFormulario').textContent = 'Agregar Nuevo Producto';

            // Limpiar la foto
            imgPrevia.src = "https://placehold.co/300x200?text=Sin+Imagen";
        }
    }
};

if (btnFormulario) btnFormulario.addEventListener('click', toggleFormulario);

// Lógica para previsualizar la imagen y validarla
if (inputImagen) {
    inputImagen.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        const imgDefault = "https://placehold.co/300x200?text=Sin+Imagen";

        if (!archivo) {
            imgPrevia.src = imgDefault;
            return;
        }

        const tiposValidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!tiposValidos.includes(archivo.type)) {
            msgErrorImagen.classList.remove('hidden');
            e.target.value = "";
            imgPrevia.src = imgDefault;
            setTimeout(() => msgErrorImagen.classList.add('hidden'), 5000);
            return;
        }

        msgErrorImagen.classList.add('hidden');
        const lector = new FileReader();
        lector.onload = function (evento) {
            imgPrevia.src = evento.target.result;
        };
        lector.readAsDataURL(archivo);
    });
}

// Subir a Cloudinary
const subirImagenCloudinary = async (archivo) => {
    const CLOUD_NAME = "dcm631bku";
    const UPLOAD_PRESET = "unicafe_imagenes";

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!respuesta.ok) throw new Error("Error al subir imagen");
        const data = await respuesta.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error en Cloudinary:", error);
        throw error;
    }
};

// ==========================================
// 4. GUARDAR (CREAR / EDITAR)
// ==========================================
if (formProducto) {
    formProducto.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const btnSubmit = document.querySelector('#formularioProducto button[type="submit"]');
            const textoOriginal = btnSubmit.textContent;
            btnSubmit.textContent = "Guardando...";
            btnSubmit.disabled = true;

            // 1. Procesar Imagen
            let urlImagenFinal = null;
            const archivoSeleccionado = inputImagen.files[0];

            if (archivoSeleccionado) {
                urlImagenFinal = await subirImagenCloudinary(archivoSeleccionado);
            } else if (productoEditandoId) {
                urlImagenFinal = imagenActualUrl;
            }

            // 2. Armar Objeto (Haciendo match exacto con lo que pide tu backend productos.model.js)
            const datos = {
                nombre: inputNombre.value,
                descripcion: inputDescripcion.value,
                idCategoria: Number(selectCategoria.value),
                stock: Number(inputStock.value),
                precioCompra: parseFloat(inputPrecioCompra.value),
                precioVenta: parseFloat(inputPrecioVenta.value),
                rfcProveedor: selectProveedor.value || null,
                imagen: urlImagenFinal
            };

            const metodo = productoEditandoId ? 'PUT' : 'POST';
            const url = productoEditandoId
                ? `https://unicafe-api.vercel.app/api/productos/${productoEditandoId}`
                : "https://unicafe-api.vercel.app/api/productos";

            const token = localStorage.getItem('token');
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error en la BD");

            alert(productoEditandoId ? "Producto actualizado." : "Producto agregado al inventario.");

            toggleFormulario();
            cargarDatosBase(); // Recargar tablas

        } catch (error) {
            console.error(error);
            alert("No se pudo guardar el producto. " + error.message);
        } finally {
            const btnSubmit = document.querySelector('#formularioProducto button[type="submit"]');
            btnSubmit.textContent = productoEditandoId ? "Actualizar Producto" : "Agregar Producto";
            btnSubmit.disabled = false;
        }
    });
}

// ==========================================
// 5. ACCIONES (EDITAR / ELIMINAR)
// ==========================================
window.prepararEdicion = async (id) => {
    try {
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/productos/${id}`);
        if (!respuesta.ok) throw new Error("Error al obtener datos");

        const p = await respuesta.json();

        // Llenamos el formulario
        inputNombre.value = p.nombre || p.vchNombre;
        inputDescripcion.value = p.descripcion || p.vchDescripcion;
        selectCategoria.value = p.idCategoria || p.intIdCategoria;
        inputStock.value = p.stock || p.intStock;
        inputPrecioCompra.value = p.precioCompra || p.decPrecioCompra;
        inputPrecioVenta.value = p.precioVenta || p.decPrecioVenta;
        selectProveedor.value = p.rfcProveedor || p.vchRFCProveedor || "";

        // Imagen
        if (inputImagen) inputImagen.value = "";
        imagenActualUrl = p.imagen || p.vchImagen || null;
        imgPrevia.src = imagenActualUrl ? imagenActualUrl : "https://placehold.co/300x200?text=Sin+Imagen";

        productoEditandoId = id;
        document.getElementById('tituloFormulario').textContent = `Editar Producto #${id}`;
        document.querySelector('#formularioProducto button[type="submit"]').textContent = 'Actualizar Producto';

        if (formContainer.classList.contains('hidden')) toggleFormulario();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar la información para editar.");
    }
};

window.eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto del inventario?")) {
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`https://unicafe-api.vercel.app/api/productos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!respuesta.ok) throw new Error("Error al eliminar");

            alert("Producto eliminado.");
            cargarDatosBase();

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al eliminar.");
        }
    }
};

// Iniciar aplicación
cargarDatosBase();