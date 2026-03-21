const contenedorPedidos = document.getElementById('contenedorMisPedidos');

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

const verificarPago = async()=>{
    const params = URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')

    if (sessionId) {
        try {
            contenedorPedidos.innerHTML = `<p class="col-span-full text-center font-bold text-unicafe-botones">⌛ Validando tu pago y registrando pedido...</p>`;

            const res = await fetch(`https://unicafe-api.vercel.app/api/pedidos/confirmar/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })

            if (res.ok) {
                localStorage.removeItem('carrito_uthh')
                alert("¡Pago confirmado y pedido registrado con exito!")
            }
        } catch (error) {
            console.error("Error al registrar la venta: ", error)
        }
        finally {
            // Limpiamos la URL para que no re-registre al refrescar
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

const cargarMisPedidos = async () => {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            alert("Debes iniciar sesión para ver tus pedidos");
            window.location.href = 'login.html';
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
            // Mostramos el QR solo si el pedido no está entregado ni cancelado, para evitar confusiones en caja. Si ya fue entregado o cancelado, mostramos un ícono representativo.
            const mostrarQR = !['entregado', 'cancelado'].includes(estadoLower);
            
            // Generamos el QR con un formato que incluya el ID del pedido para facilitar su identificación en caja
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

const init = async () => {
    await verificarPago(); // Primero registramos si hubo pago
    await cargarMisPedidos();      // Luego cargamos la lista actualizada
};

init();
