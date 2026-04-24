// componentes_js/modelo_predictivo.js
let chartInstance = null;
let ventasBaseGlobal = 26; // Se actualizará con la Base de Datos

window.cambiarTab = cambiarTab;
window.cambiarTabInterno = cambiarTabInterno;
window.alternarVisualizacion = alternarVisualizacion;

document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard();
});

async function inicializarDashboard() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('https://unicafe-api.vercel.app/api/reportes/ventas-actuales', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            // Guardamos el valor real de la base de datos para usarlo en los cálculos
            ventasBaseGlobal = data.ventasBase; 
            configurarSliders();
            ejecutarModeloBackend(); // Ejecutamos el modelo inmediatamente al tener el dato
        }
    } catch (e) { console.error("Error inicializando:", e); }
}

async function cambiarTab(tab) {
    const vGenerales = document.getElementById('vistaGenerales');
    const vPredictivo = document.getElementById('vistaPredictivo');
    const bGenerales = document.getElementById('btnTabGenerales');
    const bPredictivo = document.getElementById('btnTabPredictivo');

    const activo = ['bg-[#2A9D8F]', 'text-white', 'shadow-md'];
    const inactivo = ['bg-white', 'text-stone-700', 'border', 'border-stone-200', 'shadow-sm'];

    if (tab === 'predictivo') {
        vGenerales.classList.add('hidden');
        vPredictivo.classList.remove('hidden');

        bGenerales.classList.remove(...activo);
        bGenerales.classList.add(...inactivo);
        bPredictivo.classList.remove(...inactivo);
        bPredictivo.classList.add(...activo);
    } else {
        vPredictivo.classList.add('hidden');
        vGenerales.classList.remove('hidden');

        bGenerales.classList.remove(...inactivo);
        bGenerales.classList.add(...activo);
        bPredictivo.classList.remove(...activo);
        bPredictivo.classList.add(...inactivo);
    }
}

function cambiarTabInterno(tabName) {
     ['contentMatematicas', 'contentGrafica', 'contentTabla', 'contentInsumos'].forEach(id => {
        document.getElementById(id).classList.replace('block', 'hidden');
    });
    ['tabMatematicas', 'tabGrafica', 'tabTabla', 'tabInsumos'].forEach(id => {
        document.getElementById(id).classList.remove('tab-active-internal');
    });

    const activeContent = tabName === 'matematicas' ? 'contentMatematicas' :
        tabName === 'grafica' ? 'contentGrafica' :
            tabName === 'tabla' ? 'contentTabla' : 'contentInsumos';

    const activeTab = tabName === 'matematicas' ? 'tabMatematicas' :
        tabName === 'grafica' ? 'tabGrafica' :
            tabName === 'tabla' ? 'tabTabla' : 'tabInsumos';

    document.getElementById(activeContent).classList.replace('hidden', 'block');
    document.getElementById(activeTab).classList.add('tab-active-internal');
}

function configurarSliders() {
    const sProyeccion = document.getElementById('proyeccionSlider');
    
    const update = () => {
        const pVal = document.getElementById('proyeccionValue');
        if (pVal && sProyeccion) {
            pVal.innerText = sProyeccion.value + (sProyeccion.value == 1 ? ' mes' : ' meses');
        }
        ejecutarModeloBackend();
    };

    sProyeccion?.addEventListener('input', update);
}

async function ejecutarModeloBackend() {
    const sProyeccion = document.getElementById('proyeccionSlider');
    const token = localStorage.getItem('token');

    // Ya no exigimos que el slider de ventas exista para continuar
    if (!token) return;

    try {
        const response = await fetch('https://unicafe-api.vercel.app/api/reportes/predictivo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                ventasIniciales: ventasBaseGlobal, // Enviamos el dato de la Base de Datos
                tiempoDuplicacion: 2, 
                tiempoProyeccion: sProyeccion ? sProyeccion.value : 6 
            })
        });

        const data = await response.json();
        if (data.success) {
            actualizarUI(data.parametros, data.resultados, data.proyecciones, data.insumos);
            setTimeout(() => dibujarGrafica(data.proyecciones, data.parametros.tProyeccion), 50);
        }
    } catch (error) { console.error("Error en modelo:", error); }
}

function actualizarUI(p, r, proyecciones, insumos) {
    const mathX0 = document.getElementById('mathX0');
    if (mathX0) mathX0.innerText = p.C_global; 

    const mesTarget = document.getElementById('mesTargetFast');
    if (mesTarget) mesTarget.innerText = p.tProyeccion;
    
    const resultadoFast = document.getElementById('resultadoFinalFast');
    if (resultadoFast) resultadoFast.innerText = Math.round(r.ventasProyectadas).toLocaleString();
    
    const mathTdup = document.getElementById('mathTdup');
    if (mathTdup) mathTdup.innerText = p.td;
    
    const mathK = document.getElementById('mathK');
    if (mathK) mathK.innerText = p.k.toFixed(4);
    
    const mathEq = document.getElementById('mathEq');
    if (mathEq) mathEq.innerText = `x(t) = ${p.C_global} · e^(${p.k.toFixed(4)}t)`;

    const tbody = document.getElementById('tablaProyeccionesBody');
    if (tbody) {
        tbody.innerHTML = proyecciones.map(row => {
            let prioridadBadge = '<span class="text-stone-400">—</span>';
            
            // Lógica para definir la prioridad de compra dinámicamente
            if (row.mes > 0) {
                // Comparamos el incremento de este mes contra las ventas base (p.C_global)
                const proporcionCrecimiento = row.incremento / p.C_global;
                
                if (proporcionCrecimiento >= 1.5) { 
                    // Si el incremento es crítico (más del 150% de la base)
                    prioridadBadge = '<span class="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">Alta</span>';
                } else if (proporcionCrecimiento >= 0.8) { 
                    // Si el incremento es considerable (más del 80%)
                    prioridadBadge = '<span class="bg-[#fff9f0] text-[#e76f51] border border-[#ffb347]/40 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">Media</span>';
                } else { 
                    // Incremento manejable
                    prioridadBadge = '<span class="bg-emerald-50 text-[#2A9D8F] border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">Normal</span>';
                }
            }

            return `
                <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td class="p-4 text-sm font-medium text-stone-700">Mes ${row.mes}</td>
                    <td class="p-4 text-center font-mono font-bold text-lg text-stone-800">${Math.round(row.ventas).toLocaleString()}</td>
                    <td class="p-4 text-center font-mono font-bold text-[#8C6844]">${row.mes === 0 ? '—' : '+' + Math.round(row.incremento)}</td>
                    <td class="p-4 text-center">${prioridadBadge}</td>
                </tr>
            `;
        }).join('');
    }
    const divConclusiones = document.getElementById('conclusionesDinamicas');
    if (divConclusiones) {
        const porc = ((r.ventasProyectadas - p.C_global) / p.C_global * 100).toFixed(0);
        divConclusiones.innerHTML = `
            <p>Según el modelo matemático, si las ventas continúan duplicándose cada <strong>${p.td} mes(es)</strong>, 
            pasaremos de <strong>${p.C_global}</strong> a <strong>${Math.round(r.ventasProyectadas).toLocaleString()}</strong> unidades en el mes <strong>${p.tProyeccion}</strong>.</p>
            <p class="mt-2 text-[#8C6844] font-bold">Esto representa un incremento del ${porc}%.</p>
            <p class="mt-2">Recomendación: Ajustar las compras a proveedores y organizar turnos del personal para satisfacer esta demanda proyectada sin caer en desabasto.</p>
        `;
    }

    if (insumos && insumos.length > 0) {
        renderizarCardsInsumos(insumos, p.tProyeccion);
        renderizarTablaFormal(insumos, p.tProyeccion);
    }
}

function dibujarGrafica(proyecciones, mesProyeccion) {
    const canvas = document.getElementById('graficaPrediccion');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // 1. Nombres de los meses
    const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // 2. FIJAR MARZO COMO MES 0 (Base de datos)
    // El índice 2 corresponde a "Marzo" en nuestro arreglo nombresMeses
    const mesBaseDatos = 2; 

    // 3. Generar etiquetas empezando desde Marzo
    const labels = proyecciones.map(p => {
        // Calculamos el mes correspondiente sumando el progreso de la proyección
        const indiceMes = (mesBaseDatos + p.mes) % 12;
        const nombreMes = nombresMeses[indiceMes];
        
        // Marcamos el Mes 0 como (Base) o (Histórico) según prefieras
        return p.mes === 0 ? `${nombreMes} (Base)` : nombreMes;
    });

    const data = proyecciones.map(p => p.ventas);

    // ... (El resto del código de Chart.js permanece igual)
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Aquí se aplican las nuevas etiquetas: Marzo, Abril, Mayo...
            datasets: [{
                label: 'Ventas Proyectadas',
                data: data,
                borderColor: '#C59B42',
                backgroundColor: 'rgba(197, 155, 66, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function alternarVisualizacion(tipo) {
    const vCards = document.getElementById('contenedorCardsInsumos');
    const vTabla = document.getElementById('contenedorTablaFormal');
    const bCards = document.getElementById('btnVistaCards');
    const bTabla = document.getElementById('btnVistaTabla');

    const activo = "bg-white text-[#8C6844] shadow-sm";
    const inactivo = "text-stone-500 hover:text-stone-700";

    if (tipo === 'cards') {
        vCards.classList.remove('hidden');
        vTabla.classList.add('hidden');
        bCards.className = `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activo}`;
        bTabla.className = `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${inactivo}`;
    } else {
        vCards.classList.add('hidden');
        vTabla.classList.remove('hidden');
        bCards.className = `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${inactivo}`;
        bTabla.className = `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activo}`;
    }
}

function renderizarCardsInsumos(insumos, mesProyeccion) {
    const contenedor = document.getElementById('contenedorCardsInsumos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    insumos.forEach(item => {
        // Cálculo de escala proporcional para la barra actual respecto a la proyectada
        const anchoProporcionalBase = (item.demandaProyectada > 0) ? (item.cantidadBase / item.demandaProyectada) * 100 : 0;
        
        // Manejo seguro del porcentaje por si no viene del backend
        const pop = item.porcentajePopularidad || ((item.cantidadBase / ventasBaseGlobal) * 100).toFixed(1) || 0;

        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-5 h-full";

        card.innerHTML = `
            <div class="flex justify-between items-start gap-3 min-h-[40px]">
                <div class="flex items-start gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#C59B42] shrink-0 mt-1"></span>
                    <h5 class="font-bold text-[#8C6844] text-sm uppercase leading-tight">
                        ${item.articulo}
                    </h5>
                </div>
                <span class="text-[10px] font-bold text-[#C59B42] bg-[#fff9f0] px-2 py-0.5 rounded border border-[#ffb347]/20 shrink-0">
                    ${pop}%
                </span>
            </div>

            <div class="space-y-5">
                <div class="w-full">
                    <div class="flex justify-between text-[10px] mb-1.5 text-stone-500 font-medium">
                        <span>ACTUAL (T=0)</span>
                        <span>${item.cantidadBase} u.</span>
                    </div>
                    <div class="w-full bg-stone-100 h-6 rounded-full relative overflow-hidden border border-stone-200">
                        <div class="bg-stone-300 h-full transition-all duration-700" style="width: ${anchoProporcionalBase}%"></div>
                        <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stone-600">
                            ${item.cantidadBase}
                        </span>
                    </div>
                </div>

                <div class="w-full">
                    <div class="flex justify-between text-[10px] mb-1.5 text-[#8C6844] font-bold">
                        <span>MES ${mesProyeccion}</span>
                        <span>${item.demandaProyectada} u.</span>
                    </div>
                    <div class="w-full bg-[#fff9f0] h-8 rounded-full relative overflow-hidden border border-[#ffb347]/30">
                        <div class="bg-[#C59B42] h-full transition-all duration-1000 shadow-inner" style="width: 100%"></div>
                        <span class="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                            ${item.demandaProyectada}
                        </span>
                    </div>
                </div>
            </div>

            <div class="pt-4 border-t border-stone-100 mt-auto">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-red-500 text-sm">📈</span>
                        <span class="text-[11px] text-stone-500 font-medium">Crecimiento:</span>
                    </div>
                    <span class="text-sm font-black text-[#e76f51] whitespace-nowrap">
                        +${item.incrementoNeto} u.
                    </span>
                </div>
                
                <div class="bg-[#fff9f0] p-3 rounded-xl border border-[#ffb347]/10 w-full min-h-[85px] flex items-center">
                    <p class="text-[10px] text-stone-600 leading-snug">
                        <strong class="text-[#8C6844]">Sugerencia:</strong> Surtir <span class="font-bold text-[#e76f51]">${item.incrementoNeto}</span> unidades adicionales para evitar el desabasto proyectado.
                    </p>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function renderizarTablaFormal(insumos, mesProyeccion) {
    const cuerpoTabla = document.getElementById('cuerpoTablaInsumos');
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '';

    insumos.forEach(item => {
        const pop = item.porcentajePopularidad || ((item.cantidadBase / ventasBaseGlobal) * 100).toFixed(1) || 0;
        
        const fila = document.createElement('tr');
        fila.className = "border-b border-stone-100 hover:bg-stone-50 transition-colors";

        fila.innerHTML = `
            <td class="py-4 px-4 text-sm font-bold text-stone-700">
                ${item.articulo}
            </td>
            <td class="py-4 px-4 text-center">
                <span class="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-bold">
                    ${pop}%
                </span>
            </td>
            <td class="py-4 px-4 text-center text-sm text-stone-600">
                ${item.cantidadBase} u.
            </td>
            <td class="py-4 px-4 text-center text-sm font-black text-[#8C6844]">
                ${item.demandaProyectada} u.
            </td>
            <td class="py-4 px-4 text-right">
                <span class="text-sm font-black text-[#e76f51] bg-[#fff9f0] px-3 py-1.5 rounded-lg border border-[#ffb347]/20">
                    +${item.incrementoNeto} a surtir
                </span>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}