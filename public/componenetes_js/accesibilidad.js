window.addEventListener('load', () => {

    const btnIn = document.getElementById('btn-zoom-in');
    const btnOut = document.getElementById('btn-zoom-out');
    const btnReset = document.getElementById('btn-zoom-reset');
    const btnContrast = document.getElementById('btn-contrast');
    const btnVoz = document.getElementById('btn-voz');

    const body = document.body;

    let nivelZoom = 1;
    let modoActual = 0;
    // ---------- ZOOM ----------
    function aplicarZoom() {
        body.style.zoom = nivelZoom;
        localStorage.setItem('preferenciaZoom', nivelZoom);
    }
    if (btnIn) {
        btnIn.addEventListener('click', () => {
            if (nivelZoom < 1.5) {
                nivelZoom += 0.1;
                aplicarZoom();
            }
        });
    }
    if (btnOut) {
        btnOut.addEventListener('click', () => {
            if (nivelZoom > 0.8) {
                nivelZoom -= 0.1;
                aplicarZoom();
            }
        });
    }
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            nivelZoom = 1;
            aplicarZoom();
        });
    }
    const zoomGuardado = localStorage.getItem('preferenciaZoom');
    if (zoomGuardado) {
        nivelZoom = parseFloat(zoomGuardado);
        aplicarZoom();
    }
    // ---------- CONTRASTE ----------
    if (btnContrast) {
        btnContrast.addEventListener('click', () => {
            modoActual++;
            if (modoActual > 2) {
                modoActual = 0;
            }
            aplicarModo(modoActual);
        });
    }
    function aplicarModo(modo) {
        body.classList.remove('modo-grises', 'modo-contraste');
        if (modo === 1) {
            body.classList.add('modo-grises');
            console.log("Modo: Escala de Grises");
        }
        if (modo === 2) {
            body.classList.add('modo-contraste');
            console.log("Modo: Alto Contraste");
        }
        localStorage.setItem('modoColor', modo);
    }
    const modoGuardado = localStorage.getItem('modoColor');
    if (modoGuardado) {
        modoActual = parseInt(modoGuardado);
        aplicarModo(modoActual);
    }

     if(btnVoz){

        if (!('speechSynthesis' in window)) {
            btnVoz.style.display = 'none';
            return;
        }

        btnVoz.addEventListener('click', () => {

            const synth = window.speechSynthesis;

            if (synth.speaking) {
                synth.cancel();
                btnVoz.textContent = "🔊 Escuchar Contenido";
                btnVoz.classList.remove('hablando');
                return;
            }

            const contenido = document.querySelector('main') || document.body;
            const textoLimpio = contenido.innerText;

            const mensaje = new SpeechSynthesisUtterance(textoLimpio);

            mensaje.lang = 'es-MX';
            mensaje.rate = 1;
            mensaje.pitch = 1;

            mensaje.onend = () => {
                btnVoz.textContent = "🔊 Escuchar Contenido";
                btnVoz.classList.remove('hablando');
            };

            btnVoz.textContent = "⏹ Detener Lectura";
            btnVoz.classList.add('hablando');

            synth.speak(mensaje);
        });

    }
});