// componenetes_js/modelo_predictivo.js

let chartInstance = null;


// 1. LÓGICA DE PESTAÑAS PRINCIPALES
function cambiarTab(tab) {
    const vGenerales = document.getElementById('vistaGenerales');
    const vPredictivo = document.getElementById('vistaPredictivo');
    const bGenerales = document.getElementById('btnTabGenerales');
    const bPredictivo = document.getElementById('btnTabPredictivo');

    // Clases de estilo para botón ACTIVO (Verde) y botón INACTIVO (Blanco)
    const claseActivo = "flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all active:scale-95 bg-[#2A9D8F] text-white shadow-md hover:bg-[#238b7f]";
    const claseInactivo = "flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all active:scale-95 bg-white text-stone-700 border border-stone-200 shadow-sm hover:bg-stone-50";

    if (tab === 'predictivo') {
        vGenerales.classList.add('hidden'); vGenerales.classList.remove('block');
        vPredictivo.classList.remove('hidden'); vPredictivo.classList.add('block');
        
        bGenerales.className = claseInactivo;
        bPredictivo.className = claseActivo;
        
        configurarSliders(); 
    } else {
        vPredictivo.classList.add('hidden'); vPredictivo.classList.remove('block');
        vGenerales.classList.remove('hidden'); vGenerales.classList.add('block');
        
        bPredictivo.className = claseInactivo;
        bGenerales.className = claseActivo;
    }
}


// 2. LÓGICA DE PESTAÑAS INTERNAS (Math, Gráfica, Tabla)
function cambiarTabInterno(tabName) {
    // Ocultar todos los contenidos
    document.getElementById('contentMatematicas').classList.replace('block', 'hidden');
    document.getElementById('contentGrafica').classList.replace('block', 'hidden');
    document.getElementById('contentTabla').classList.replace('block', 'hidden');
    
    // Quitar clase activa de todos los botones
    document.getElementById('tabMatematicas').classList.remove('tab-active-internal');
    document.getElementById('tabGrafica').classList.remove('tab-active-internal');
    document.getElementById('tabTabla').classList.remove('tab-active-internal');

    // Mostrar el seleccionado
    if(tabName === 'matematicas') {
        document.getElementById('contentMatematicas').classList.replace('hidden', 'block');
        document.getElementById('tabMatematicas').classList.add('tab-active-internal');
    } else if(tabName === 'grafica') {
        document.getElementById('contentGrafica').classList.replace('hidden', 'block');
        document.getElementById('tabGrafica').classList.add('tab-active-internal');
    } else if(tabName === 'tabla') {
        document.getElementById('contentTabla').classList.replace('hidden', 'block');
        document.getElementById('tabTabla').classList.add('tab-active-internal');
    }
}


// 3. EVENTOS DE LOS SLIDERS
function configurarSliders() {
    const sVentas = document.getElementById('ventasSlider');
    const sDuplicacion = document.getElementById('duplicacionSlider');
    const sProyeccion = document.getElementById('proyeccionSlider');

    // Función para actualizar textos y llamar a la API
    const update = () => {
        document.getElementById('ventasValue').innerText = sVentas.value;
        document.getElementById('duplicacionValue').innerText = sDuplicacion.value + (sDuplicacion.value == 1 ? ' mes' : ' meses');
        document.getElementById('proyeccionValue').innerText = sProyeccion.value + (sProyeccion.value == 1 ? ' mes' : ' meses');
        ejecutarModeloBackend();
    };

    // Escuchar cambios (usamos 'input' para que sea en tiempo real al arrastrar)
    sVentas.addEventListener('input', update);
    sDuplicacion.addEventListener('input', update);
    sProyeccion.addEventListener('input', update);

    // Ejecutar primera vez
    update();
}


// 4. CONEXIÓN CON LA API EN VERCEL
async function ejecutarModeloBackend() {
    const x0 = document.getElementById('ventasSlider').value;
    const td = document.getElementById('duplicacionSlider').value;
    const t = document.getElementById('proyeccionSlider').value;

    try {
        // Asegúrate de usar la URL de tu Vercel aquí:
        const response = await fetch('https://unicafe-api.vercel.app/api/reportes/predictivo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ventasIniciales: x0, tiempoDuplicacion: td, tiempoProyeccion: t })
        });

        const data = await response.json();
        
        if(data.success) {
            actualizarUI(data.parametros, data.resultados, data.proyecciones);
            dibujarGrafica(data.proyecciones, data.parametros.tProyeccion);
        }
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}


// 5. ACTUALIZAR INTERFAZ (DOM)
function actualizarUI(p, r, proyecciones) {
    const kStr = p.k.toFixed(4);
    
    // Panel Rápido Izquierdo
    document.getElementById('mesTargetFast').innerText = p.tProyeccion;
    document.getElementById('resultadoFinalFast').innerText = Math.round(r.ventasProyectadas).toLocaleString();

    // Pestaña Matemáticas
    document.getElementById('mathX0').innerText = p.x0;
    document.getElementById('mathTdup').innerText = p.td;
    document.getElementById('mathK').innerText = kStr;
    document.getElementById('mathEq').innerText = `x(t) = ${p.x0} · e^(${kStr}t)`;
    
    // Actualizar todos los span con la clase mathTdupVal
    document.querySelectorAll('.mathTdupVal').forEach(el => el.innerText = p.td);

    // Pestaña Tabla
    const tbody = document.getElementById('tablaProyeccionesBody');
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

    // Conclusiones Dinámicas
    const porc = ((r.ventasProyectadas - p.x0) / p.x0 * 100).toFixed(0);
    document.getElementById('conclusionesDinamicas').innerHTML = `
        <p>Según el modelo matemático, si las ventas continúan duplicándose cada <strong>${p.td} mes(es)</strong>, 
        pasaremos de <strong>${p.x0}</strong> a <strong>${Math.round(r.ventasProyectadas).toLocaleString()}</strong> unidades en el mes <strong>${p.tProyeccion}</strong>.</p>
        <p class="mt-2 text-[#8C6844] font-bold">Esto representa un incremento del ${porc}%.</p>
        <p class="mt-2">Recomendación: Ajustar las compras a proveedores y organizar turnos del personal para satisfacer esta demanda proyectada sin caer en desabasto.</p>
    `;
}


// 6. DIBUJAR GRÁFICA (Chart.js)
function dibujarGrafica(proyecciones, mesProyeccion) {
    const ctx = document.getElementById('graficaPrediccion').getContext('2d');
    const labels = proyecciones.map(p => `Mes ${p.mes}`);
    const data = proyecciones.map(p => p.ventas);

    if (chartInstance) chartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(197, 155, 66, 0.4)'); // Color Acento UNICAFE
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