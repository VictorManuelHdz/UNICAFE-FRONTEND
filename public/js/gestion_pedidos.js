const tbodyPedidos = document.getElementById('tabla-pedidos-body');
const mensajeAlerta = document.getElementById('mensajeAlerta');
const modalDetalle = document.getElementById('modalDetallePedido');
const modalCaja = document.getElementById('modalCaja');

const mostrarAlerta = (mensaje, tipo = 'exito') => {
    mensajeAlerta.textContent = mensaje;
    mensajeAlerta.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    mensajeAlerta.classList.add(tipo === 'exito' ? 'bg-green-500' : 'bg-red-500');
    setTimeout(() => mensajeAlerta.classList.add('hidden'), 3000);
};

const formatearFecha = (cadenaFecha) => {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(cadenaFecha).toLocaleDateString('es-MX', opciones);
};

const getColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const cargarPedidos = async () => {
    try {
        tbodyPedidos.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 font-bold animate-pulse">Actualizando tabla... ☕</td></tr>';

        const token = localStorage.getItem('token');
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error("Error al cargar los pedidos");

        const pedidos = await respuesta.json();

        if (pedidos.length === 0) {
            tbodyPedidos.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500">No hay pedidos registrados aún.</td></tr>';
            return;
        }

        const opcionesEstado = ['Pendiente', 'Preparando', 'Listo', 'Entregado', 'Cancelado'];

        tbodyPedidos.innerHTML = pedidos.map(p => {
            const selectOptions = opcionesEstado.map(est =>
                `<option value="${est}" ${est.toLowerCase() === (p.estado || 'pendiente').toLowerCase() ? 'selected' : ''}>${est}</option>`
            ).join('');

            return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="p-4 text-center font-bold text-gray-800">#${p.idPedido}</td>
                <td class="p-4 font-bold text-unicafe-header-dark">${p.nombreCliente} ${p.apellidoCliente}</td>
                <td class="p-4 text-gray-600 text-xs md:text-sm">${formatearFecha(p.fecha)}</td>
                <td class="p-4 text-center">
                    <select onchange="actualizarEstadoBd(${p.idPedido}, this)" class="px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer transition-colors shadow-sm ${getColorEstado(p.estado)}">
                        ${selectOptions}
                    </select>
                </td>
                <td class="p-4 text-right font-bold text-gray-800">$${Number(p.total).toFixed(2)}</td>
                <td class="p-4 text-center">
                    <button onclick="verDetallePedido(${p.idPedido})" class="bg-unicafe-btn-editar text-white w-9 h-9 rounded-md font-bold hover:brightness-110 transition-all shadow-sm flex items-center justify-center mx-auto" title="Ver Ticket">
                        👁️
                    </button>
                </td>
            </tr>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        mostrarAlerta("No se pudieron cargar los pedidos.", "error");
        tbodyPedidos.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500 font-bold">Error de conexión.</td></tr>';
    }
};

window.verDetallePedido = async (idPedido) => {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/pedidos/${idPedido}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error("Error al cargar detalles");

        const data = await respuesta.json();
        const info = data.info;
        const articulos = data.articulos;

        document.getElementById('ticketFolio').textContent = info.intIdPedido;
        document.getElementById('ticketCliente').textContent = `${info.vchNombres} ${info.vchApaterno}`;
        document.getElementById('ticketFecha').textContent = formatearFecha(info.dtmFechaHora);
        document.getElementById('ticketNotas').textContent = info.vchNotas || "Sin notas adicionales.";

        const tbodyArticulos = document.getElementById('ticketArticulos');
        tbodyArticulos.innerHTML = articulos.map(art => {
            const nombre = art.nombreProducto || art.nombrePlatillo || 'Artículo Desconocido';
            return `
                <tr class="border-b border-gray-100 last:border-0">
                    <td class="p-3 text-center font-bold text-gray-700">${art.intCantidad}x</td>
                    <td class="p-3 text-gray-800">${nombre}</td>
                    <td class="p-3 text-right text-gray-600">$${Number(art.decPrecioUnitario).toFixed(2)}</td>
                    <td class="p-3 text-right font-bold text-gray-800">$${Number(art.decSubtotal).toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('ticketTotal').textContent = `$${Number(info.decTotal).toFixed(2)}`;

        modalDetalle.classList.remove('hidden');
        modalDetalle.classList.add('flex');
        setTimeout(() => {
            modalDetalle.classList.remove('opacity-0');
            modalCaja.classList.remove('scale-95');
        }, 10);

    } catch (error) {
        console.error(error);
        mostrarAlerta("No se pudo cargar el detalle del pedido.", "error");
    }
};

// Función para cambiar el estado directo a la BD
window.actualizarEstadoBd = async (idPedido, selectElement) => {
    const nuevoEstado = selectElement.value;

    // Cambiamos el color temporalmente para que el usuario vea que reaccionó
    selectElement.className = `px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer transition-colors shadow-sm ${getColorEstado(nuevoEstado)}`;

    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/pedidos/${idPedido}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!respuesta.ok) throw new Error("Error al actualizar");
        mostrarAlerta(`Pedido #${idPedido} actualizado a ${nuevoEstado}`, "exito");

    } catch (error) {
        console.error(error);
        mostrarAlerta("Error al cambiar el estado", "error");
        // Revertimos el select al estado anterior en caso de error
        cargarPedidos();
    }
};

window.cerrarModalPedido = () => {
    modalDetalle.classList.add('opacity-0');
    modalCaja.classList.add('scale-95');
    setTimeout(() => {
        modalDetalle.classList.add('hidden');
        modalDetalle.classList.remove('flex');
    }, 300);
};

// Cerrar modal al hacer clic afuera
modalDetalle.addEventListener('click', (e) => {
    if (e.target === modalDetalle) window.cerrarModalPedido();
});

// Inicializar
cargarPedidos();