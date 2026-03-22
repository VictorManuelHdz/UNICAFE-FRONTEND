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

        // 1. Llenar las Tarjetas Superiores
        document.getElementById('resumenValor').textContent = formatearMoneda(data.valorBodega);
        document.getElementById('resumenGanancia').textContent = formatearMoneda(data.gananciaProyectada);
        document.getElementById('resumenAlertas').textContent = data.alertas;

        // 2. Llenar Tabla de Historial de Precios
        const tbodyHistorial = document.getElementById('tablaHistorial');
        if (data.historialPrecios.length === 0) {
            tbodyHistorial.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No hay cambios recientes registrados.</td></tr>`;
        } else {
            tbodyHistorial.innerHTML = data.historialPrecios.map(item => {
                const viejo = Number(item.precio_viejo);
                const nuevo = Number(item.precio_nuevo);
                const diferencia = nuevo - viejo;
                
                // Determinamos si subió o bajó para darle color
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

        // 3. Llenar Tabla de Sugerencias de Compra
        const tbodySugerencias = document.getElementById('tablaSugerencias');
        if (data.sugerenciasCompra.length === 0) {
            tbodySugerencias.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-green-600 font-bold">¡Todo en orden! Inventario saludable.</td></tr>`;
        } else {
            // Nota: Las columnas coinciden exactamente con lo que devuelve tu SP (Producto, StockActual, CantidadSugerida, Proveedor)
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
                        <button onclick="alert('Funcionalidad de pedir en construcción')" class="px-3 py-1.5 rounded-md text-xs font-bold bg-[#ffb347] text-[#603813] hover:bg-[#ff9c12] transition-colors cursor-pointer shadow-sm">
                            Pedir a proveedor
                        </button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (error) {
        console.error(error);
        alert("Hubo un error al cargar la información del panel.");
    }
};

// Cargar al iniciar la página
cargarReportes();