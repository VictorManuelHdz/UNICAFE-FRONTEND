const mostrarToast = (mensaje, tipo = 'exito') => {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 right-6 z-[9999] transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold';
        toast.innerHTML = `<span id="toast-icon" class="text-2xl"></span><span id="toast-message"></span>`;
        document.body.appendChild(toast);
    }

    toast.querySelector('#toast-message').textContent = mensaje;
    toast.classList.remove('bg-[#2A9D8F]', 'bg-[#e76f51]'); 

    if (tipo === 'exito') {
        toast.classList.add('bg-[#2A9D8F]');
        toast.querySelector('#toast-icon').textContent = '✅';
    } else {
        toast.classList.add('bg-[#e76f51]');
        toast.querySelector('#toast-icon').textContent = '⚠️';
    }

    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 3000);
};

const mostrarConfirmacion = (mensaje) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-confirmacion');
        const caja = document.getElementById('modal-confirmacion-caja');
        
        document.getElementById('modal-confirmacion-mensaje').textContent = mensaje;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            caja.classList.remove('scale-95');
        }, 10);

        const cerrarYResolver = (resultado) => {
            modal.classList.add('opacity-0');
            caja.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                resolve(resultado);
            }, 300);
        };

        document.getElementById('btn-cancelar-accion').onclick = () => cerrarYResolver(false);
        document.getElementById('btn-confirmar-accion').onclick = () => cerrarYResolver(true);
    });
};

const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);
};

const formatearFecha = (cadenaFecha) => {
    if (!cadenaFecha) return 'Fecha desconocida';
    return new Date(cadenaFecha).toLocaleString('es-MX', { 
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
};

const cargarReportes = async () => {
    try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch('https://unicafe-api.vercel.app/api/reportes/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!respuesta.ok) throw new Error("Error al cargar reportes");

        const data = await respuesta.json();

        document.getElementById('resumenValor').textContent = formatearMoneda(data.valorBodega);
        document.getElementById('resumenGanancia').textContent = formatearMoneda(data.gananciaProyectada);
        document.getElementById('resumenAlertas').textContent = data.alertas;

        const tbodyHistorial = document.getElementById('tablaHistorial');
        if (data.historialPrecios.length === 0) {
            tbodyHistorial.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No hay cambios recientes registrados.</td></tr>`;
        } else {
            tbodyHistorial.innerHTML = data.historialPrecios.map(item => {
                const viejo = Number(item.precio_viejo);
                const nuevo = Number(item.precio_nuevo);
                const diferencia = nuevo - viejo;
                
                let colorVariacion = diferencia > 0 ? 'text-red-600' : 'text-green-600';
                let textoVariacion = diferencia > 0 ? `Subida ${formatearMoneda(diferencia)}` : `Bajada ${formatearMoneda(Math.abs(diferencia))}`;

                return `
                <tr>
                    <td class="p-3 font-semibold">${item.producto}</td>
                    <td class="p-3">${formatearMoneda(viejo)}</td>
                    <td class="p-3">${formatearMoneda(nuevo)}</td>
                    <td class="p-3 ${colorVariacion} font-bold">${textoVariacion}</td>
                    <td class="p-3 text-xs text-gray-500">${formatearFecha(item.fecha_cambio)}</td>
                </tr>`;
            }).join('');
        }

        const tbodySugerencias = document.getElementById('tablaSugerencias');
        if (data.sugerenciasCompra.length === 0) {
            tbodySugerencias.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-green-600 font-bold">¡Todo en orden! Inventario saludable.</td></tr>`;
        } else {
            tbodySugerencias.innerHTML = data.sugerenciasCompra.map(item => `
                <tr>
                    <td class="p-3 font-semibold">${item.Producto}</td>
                    <td class="p-3 text-center text-red-500 font-bold">${item.StockActual}</td>
                    <td class="p-3 text-center text-[#2A9D8F] font-bold">+${item.CantidadSugerida}</td>
                    <td class="p-3">
                        <div class="flex flex-col">
                            <span>${item.Proveedor || 'Sin Proveedor'}</span>
                            <span class="text-xs text-gray-500">${item.Contacto || ''}</span>
                        </div>
                    </td>
                    <td class="p-3">
                        <button onclick="solicitarPedido('${item.Producto}', '${item.Proveedor || 'el proveedor'}', ${item.CantidadSugerida})" class="px-3 py-1.5 rounded-md text-xs font-bold bg-[#ffb347] text-[#603813] hover:bg-[#ff9c12] transition-colors cursor-pointer shadow-sm">
                            Pedir a proveedor
                        </button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Hubo un error al cargar la información del panel.", "error");
    }
};

window.solicitarPedido = async (producto, proveedor, cantidad) => {
    const confirmado = await mostrarConfirmacion(`¿Deseas generar una orden de compra por ${cantidad} unidades de ${producto} a ${proveedor}?`);
    
    if (confirmado) {
        mostrarToast(`Solicitud enviada a ${proveedor} exitosamente.`, "exito");
    }
};

// Iniciar
cargarReportes();