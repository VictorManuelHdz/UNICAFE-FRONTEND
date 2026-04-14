// componenetes_js/modelo_predictivo.js

let chartInstance = null;


// 1. LÓGICA DE PESTAÑAS PRINCIPALES
async function cambiarTab(tab) {
    const vGenerales = document.getElementById('vistaGenerales');
    const vPredictivo = document.getElementById('vistaPredictivo');
    const bGenerales = document.getElementById('btnTabGenerales');
    const bPredictivo = document.getElementById('btnTabPredictivo');

    const claseActivo = "flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all active:scale-95 bg-[#2A9D8F] text-white shadow-md hover:bg-[#238b7f]";
    const claseInactivo = "flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all active:scale-95 bg-white text-stone-700 border border-stone-200 shadow-sm hover:bg-stone-50";

    if (tab === 'predictivo') {
        vGenerales.classList.add('hidden'); vGenerales.classList.remove('block');
        vPredictivo.classList.remove('hidden'); vPredictivo.classList.add('block');

        bGenerales.className = claseInactivo;
        bPredictivo.className = claseActivo;

        // Consultar Ventas Base desde BD
        try {
            const token = localStorage.getItem('token')

            const response = await fetch('https://unicafe-api.vercel.app/api/reportes/ventas-actuales',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'content-type': 'aplication/json'
                }
            });
            
            const data = await response.json();

            if (data.success) {
                const sVentas = document.getElementById('ventasSlider');
                sVentas.value = data.ventasBase;
                document.getElementById('ventasValue').innerHTML = `${data.ventasBase} <span class="text-[10px] text-green-700 ml-1">(Base de Datos)</span>`;
            }
        } catch (error) {
            console.error("No se pudo obtener el historial de la BD:", error);
        }

        configurarSliders();
    } else {
        vPredictivo.classList.add('hidden'); vPredictivo.classList.remove('block');
        vGenerales.classList.remove('hidden'); vGenerales.classList.add('block');

        bPredictivo.className = claseInactivo;
        bGenerales.className = claseActivo;
    }
}


// 2. LÓGICA DE PESTAÑAS INTERNAS

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


// 3. EVENTOS DE LOS SLIDERS
function configurarSliders() {
    const sVentas = document.getElementById('ventasSlider');
    const sDuplicacion = document.getElementById('duplicacionSlider');
    const sProyeccion = document.getElementById('proyeccionSlider');

    const update = () => {
        if (!document.getElementById('ventasValue').innerHTML.includes('Base de Datos')) {
            document.getElementById('ventasValue').innerText = sVentas.value;
        } else {
            document.getElementById('ventasValue').innerHTML = `${sVentas.value} <span class="text-[10px] text-green-700 ml-1">(Base de Datos)</span>`;
        }

        document.getElementById('duplicacionValue').innerText = sDuplicacion.value + (sDuplicacion.value == 1 ? ' mes' : ' meses');
        document.getElementById('proyeccionValue').innerText = sProyeccion.value + (sProyeccion.value == 1 ? ' mes' : ' meses');
        ejecutarModeloBackend();
    };

    sVentas.addEventListener('input', update);
    sDuplicacion.addEventListener('input', update);
    sProyeccion.addEventListener('input', update);

    update();
}


// 4. CONEXIÓN CON LA API
// 4. CONEXIÓN CON LA API (Corregida con Token)
async function ejecutarModeloBackend() {
    const x0 = document.getElementById('ventasSlider').value;
    const td = document.getElementById('duplicacionSlider').value;
    const t = document.getElementById('proyeccionSlider').value;

    try {
        // Obtenemos el token del localStorage
        const token = localStorage.getItem('token');

        const response = await fetch('https://unicafe-api.vercel.app/api/reportes/predictivo', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // AGREGAR ESTA LÍNEA:
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                ventasIniciales: x0, 
                tiempoDuplicacion: td, 
                tiempoProyeccion: t 
            })
        });

        if (response.status === 401 || response.status === 403) {
            console.error("No autorizado para ver predicciones");
            return;
        }

        const data = await response.json();

        if (data.success) {
            actualizarUI(data.parametros, data.resultados, data.proyecciones, data.insumos);
            dibujarGrafica(data.proyecciones, data.parametros.tProyeccion);
        }
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}


// 5. ACTUALIZAR INTERFAZ (DOM)
function actualizarUI(p, r, proyecciones, insumos) {
    const kStr = p.k.toFixed(4);

    // Panel Rápido Izquierdo
    document.getElementById('mesTargetFast').innerText = p.tProyeccion;
    document.getElementById('resultadoFinalFast').innerText = Math.round(r.ventasProyectadas).toLocaleString();

    // Pestaña Matemáticas
    document.getElementById('mathX0').innerText = p.C;
    document.getElementById('mathTdup').innerText = p.td;
    document.getElementById('mathK').innerText = kStr;
    document.getElementById('mathEq').innerText = `x(t) = ${p.C} · e^(${kStr}t)`;
    document.querySelectorAll('.mathTdupVal').forEach(el => el.innerText = p.td);

    // Pestaña Tabla Principal
    const tbody = document.getElementById('tablaProyeccionesBody');
    if (tbody) {
        tbody.innerHTML = '';
        proyecciones.forEach(row => {
            const isProy = row.mes === p.tProyeccion;
            const bg = isProy ? 'bg-[#fff9f0]' : '';
            const tag = isProy ? `<span class="bg-[#ffb347] text-[#603813] text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase">Proyección</span>` : '';
            const inc = row.mes === 0 ? '—' : `+${Math.round(row.incremento)}`;
            const status = row.mes <= p.tProyeccion ? `<span class="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">En Rango</span>` : `<span class="text-stone-500 bg-stone-100 px-2 py-1 rounded text-xs">Extrapolado</span>`;

            tbody.innerHTML += `
                <tr class="${bg} border-b border-stone-100">
                    <td class="p-3">Mes ${row.mes} ${tag}</td>
                    <td class="p-3 text-right font-mono font-bold">${Math.round(row.ventas).toLocaleString()}</td>
                    <td class="p-3 text-right text-stone-500 font-mono">${inc}</td>
                    <td class="p-3 text-center">${status}</td>
                </tr>
            `;
        });
    }

    // Conclusiones Dinámicas
    const porc = ((r.ventasProyectadas - p.C) / p.C * 100).toFixed(0);
    const divConclusiones = document.getElementById('conclusionesDinamicas');
    if (divConclusiones) {
        divConclusiones.innerHTML = `
            <p>Según el modelo matemático, si las ventas continúan duplicándose cada <strong>${p.td} mes(es)</strong>, 
            pasaremos de <strong>${p.C}</strong> a <strong>${Math.round(r.ventasProyectadas).toLocaleString()}</strong> unidades en el mes <strong>${p.tProyeccion}</strong>.</p>
            <p class="mt-2 text-[#8C6844] font-bold">Esto representa un incremento del ${porc}%.</p>
            <p class="mt-2">Recomendación: Ajustar las compras a proveedores y organizar turnos del personal para satisfacer esta demanda proyectada sin caer en desabasto.</p>
        `;
    }

    // Pestaña Insumos (Top Productos)
    document.querySelectorAll('.mesInsumosVal').forEach(el => el.innerText = p.tProyeccion);
    const tbodyInsumos = document.getElementById('tablaInsumosBody');
    if (tbodyInsumos) {
        tbodyInsumos.innerHTML = '';
        if (insumos && insumos.length > 0) {
            insumos.forEach(item => {
                tbodyInsumos.innerHTML += `
                    <tr class="hover:bg-stone-50 transition-colors">
                        <td class="p-3 font-semibold text-stone-700 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#2A9D8F]"></span>
                            ${item.articulo}
                            <span class="text-[10px] font-normal text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">${item.porcentajePopularidad}% del total</span>
                        </td>
                        <td class="p-3 text-center text-stone-500">${item.cantidadBase} u.</td>
                        <td class="p-3 text-center font-bold text-[#8C6844] text-lg bg-[#fff9f0]">${item.demandaProyectada} u.</td>
                        <td class="p-3 text-right text-[#e76f51] font-mono font-bold">+${item.incrementoNeto} a surtir</td>
                    </tr>
                `;
            });
        } else {
            tbodyInsumos.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-stone-500">No hay suficientes datos históricos.</td></tr>`;
        }
    }
}


// 6. DIBUJAR GRÁFICA 
function dibujarGrafica(proyecciones, mesProyeccion) {
    const ctx = document.getElementById('graficaPrediccion').getContext('2d');
    const labels = proyecciones.map(p => `Mes ${p.mes}`);
    const data = proyecciones.map(p => p.ventas);

    if (chartInstance) chartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(197, 155, 66, 0.4)');
    gradient.addColorStop(1, 'rgba(197, 155, 66, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas Proyectadas',
                data: data,
                borderColor: '#C59B42',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#8C6844',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}