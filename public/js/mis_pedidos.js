const contenedorPedidos = document.getElementById('contenedorMisPedidos');
const modalDetalle = document.getElementById('modalDetallePedido');
const modalCaja = document.getElementById('modalCaja');

const mostrarToast = (mensaje, tipo = 'exito') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold mb-3';
    
    if (tipo === 'exito') {
        toast.classList.add('bg-[#2A9D8F]');
        toast.innerHTML = `<span class="text-2xl">✅</span><span>${mensaje}</span>`;
    } else {
        toast.classList.add('bg-[#e76f51]');
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

const formatearFecha = (cadenaFecha) => {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(cadenaFecha).toLocaleDateString('es-MX', opciones);
};

const getColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'listo': return 'bg-green-500 text-white border-green-600 animate-pulse';
        case 'entregado': return 'bg-gray-200 text-gray-700 border-gray-300';
        case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const verificarPago = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
        try {
            const res = await fetch(`https://unicafe-api.vercel.app/api/pedidos/confirmar/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    localStorage.removeItem('carrito_uthh');
                    mostrarToast("¡Tu pedido se registró con éxito!", "exito");
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    console.error("Fallo en base de datos:", data.detalle);
                    mostrarToast("Error al registrar el pedido: " + data.detalle, "error");
                }
            } else {
                throw new Error("Error en la respuesta del servidor al confirmar pago.");
            }
        } catch (error) {
            console.error("Error en la petición fetch:", error);
            mostrarToast("Hubo un error al verificar tu pago. Consulta con caja.", "error");
        }
    }
};

const cargarMisPedidos = async () => {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            mostrarToast("Debes iniciar sesión para ver tus pedidos", "error");
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const usuario = JSON.parse(usuarioStr);
        const idUsuario = usuario.id || usuario.intIdUsuario;
        const token = localStorage.getItem('token');

        const respuesta = await fetch(`https://unicafe-api.vercel.app/api/pedidos/usuario/${idUsuario}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error("Error al cargar pedidos");

        const pedidos = await respuesta.json();

        if (pedidos.length === 0) {
            contenedorPedidos.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <span class="text-6xl block mb-4">🍔</span>
                    <h3 class="text-xl font-bold text-gray-700">Aún no has hecho pedidos</h3>
                    <p class="text-gray-500 mt-2">¡Ve al menú y pide algo delicioso!</p>
                </div>`;
            return;
        }

        contenedorPedidos.innerHTML = pedidos.map(p => {
            const estadoLower = (p.estado || 'pendiente').toLowerCase();
            const mostrarQR = !['entregado', 'cancelado'].includes(estadoLower);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PEDIDO_UTHH_${p.idPedido}`;

            return `
            <div class="bg-white rounded-xl shadow-sm border border-unicafe-border overflow-hidden flex flex-col">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <span class="font-black text-gray-700">Folio #${p.idPedido}</span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold border ${getColorEstado(p.estado)}">
                        ${p.estado || 'Pendiente'}
                    </span>
                </div>
                
                <div class="p-5 flex-1 flex flex-col items-center justify-center text-center">
                    ${mostrarQR ? `
                        <p class="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">Muestra este QR en caja</p>
                        <div class="p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-4 inline-block">
                            <img src="${qrUrl}" alt="QR Pedido" class="w-[150px] h-[150px]">
                        </div>
                    ` : `
                        <div class="w-[150px] h-[150px] flex items-center justify-center bg-gray-50 rounded-lg mb-4 border border-gray-100 text-4xl opacity-50">
                            ${estadoLower === 'entregado' ? '✅' : '❌'}
                        </div>
                    `}
                    
                    <div class="w-full text-left mt-2 border-t border-gray-100 pt-4">
                        <p class="text-sm text-gray-500 mb-1">Fecha: <span class="font-bold text-gray-700">${formatearFecha(p.fecha)}</span></p>
                        <p class="text-sm text-gray-500">Total pagado: <span class="font-black text-unicafe-botones text-lg">$${Number(p.total).toFixed(2)}</span></p>
                        
                        <button onclick="verDetallePedido(${p.idPedido})" class="mt-4 w-full bg-[#fdfbf7] border border-unicafe-border text-unicafe-header-dark py-2.5 rounded-lg font-bold hover:bg-unicafe-navbar transition-colors shadow-sm flex justify-center items-center gap-2">
                            📋 Ver detalle del pedido
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        contenedorPedidos.innerHTML = '<p class="col-span-full text-center text-red-500 font-bold">Ocurrió un error al cargar tus pedidos.</p>';
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

        // Llenar tabla de artículos
        const tbodyArticulos = document.getElementById('ticketArticulos');
        tbodyArticulos.innerHTML = articulos.map(art => {
            const nombre = art.nombreProducto || art.nombrePlatillo || 'Artículo Desconocido';
            return `
                <tr class="border-b border-gray-100 last:border-0">
                    <td class="p-3 text-center font-bold text-gray-700">${art.intCantidad}x</td>
                    <td class="p-3 text-gray-800">${nombre}</td>
                    <td class="p-3 text-right font-bold text-gray-800">$${Number(art.decSubtotal).toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        // Llenar total
        document.getElementById('ticketTotal').textContent = `$${Number(info.decTotal).toFixed(2)}`;

        modalDetalle.classList.remove('hidden');
        modalDetalle.classList.add('flex');
        setTimeout(() => {
            modalDetalle.classList.remove('opacity-0');
            modalCaja.classList.remove('scale-95');
        }, 10);

    } catch (error) {
        console.error(error);
        mostrarToast("No se pudo cargar el detalle del pedido.", "error");
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

if (modalDetalle) {
    modalDetalle.addEventListener('click', (e) => {
        if (e.target === modalDetalle) window.cerrarModalPedido();
    });
}

// Iniciar
const init = async () => {
    await verificarPago(); 
    await cargarMisPedidos(); 
};

init();