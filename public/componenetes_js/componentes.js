class Header extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        // Detectamos si estamos en la raíz (index) o dentro de una carpeta
        const isInRoot = currentPath.endsWith('index.html') || currentPath.endsWith('/');

        // Si el index está en la raíz y login en la carpeta 'public', usamos el prefijo
        const folderPrefix = isInRoot ? "public/" : "";

        this.innerHTML = `
        <header class="flex h-20 items-center justify-between bg-unicafe-header text-white shadow-md">
            <div class="flex items-center gap-3">
                <div class="flex size-10 item-center justify-center rounded-full bg-gray-300 text-gray-700 w-10 h-10">
                    <span class="text-2xl">👤</span>
                </div>
                <a class="rounded-xl bg-white px-5 py-1.5 font-bold text-stone-900 underline-offset-2 transition-transform hover:scale-105 active:scale-96" 
                   href="${folderPrefix}login.html">Iniciar Sesión</a>
            </div>
            <h1 class="text-3xl font-black uppercase">CAFETERIA UTHH</h1>
            <div class="hidden w-48 md:block"></div>
        </header>`;
    }
}
customElements.define('header-component', Header);


class NavSecundario extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        const isInRoot = currentPath.endsWith('index.html') || currentPath.endsWith('/');

        // Para volver al Home desde una subcarpeta necesitamos "../"
        const toRoot = isInRoot ? "" : "../";
        // Para ir a los otros archivos desde la raíz necesitamos entrar a la carpeta (ej: "public/")
        const toFolder = isInRoot ? "public/" : "";

        const activeClass = (page) =>
            (currentPath.includes(page) || (page === 'index' && isInRoot)) ? 'is-active' : '';

        this.innerHTML = `
        <nav class="bg-unicafe-navbar py-4 border-b border-unicafe-border/30">
          <div class="container mx-auto flex items-center px-4">
            <button class="text-2xl text-stone-700 hover:text-stone-900 md:hidden" id="btnMenu">☰</button>
            <div class="flex flex-1 flex-wrap justify-center gap-4" id="menuEnlaces">
                <a class="pill ${activeClass('index')}" href="${toRoot}index.html">
                    HOME <span class="ico">🏠</span>
                </a>
                <a class="pill ${activeClass('productos')}" href="${toFolder}productos.html">
                    PRODUCTOS <span class="ico">📦</span>
                </a>
                <a class="pill ${activeClass('menu')}" href="${toFolder}menu.html">
                    MENÚ <span class="ico">🍽️</span>
                </a>
                <a class="pill ${activeClass('pedidos')}" href="${toFolder}pedidos.html">
                    PEDIDOS <span class="ico">📋</span>
                </a>
                <a class="pill ${activeClass('gestion_productos')}" href="${toFolder}gestion_productos.html">
                    PRODUCTOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('terminos')}" href="${toFolder}gestion_terminos.html">
                    TÉRMINOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('Aviso_de_privacidad')}" href="${toFolder}Aviso_de_privacidad.html">
                    AVISO <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('somos')}" href="${toFolder}gestion_somos.html">
                    SOMOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('usuario')}" href="${toFolder}usuarios.html">
                    REGISTROS <span class="ico">👤</span>
                </a>
                <a class="pill ${activeClass('reportes')}" href="${toFolder}reportes.html">
                    REPORTES <span class="ico">👤</span>
                </a>

            </div>
          </div>
        </nav>`;
    }
}
customElements.define('nav-secundario', NavSecundario);

class Footer extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        const isInRoot = currentPath.endsWith('index.html') || currentPath.endsWith('/');

        // Reutilizamos tu lógica: si estamos en la raíz, entramos a public/. Si no, ruta directa.
        const toFolder = isInRoot ? "public/" : "";

        this.innerHTML = `
        <footer class="w-full bg-unicafe-header text-white p-8 mt-12 text-center shadow-inner">
            <p class="font-bold text-base mb-3">Universidad Tecnológica de la Huasteca Hidalguense</p>
            <p class="text-sm mb-4 text-gray-300">&copy; 2026 Cafetería UTHH. Todos los derechos reservados.</p>

            <div class="flex justify-center gap-4 text-xs font-semibold uppercase tracking-wider">
                <a href="${toFolder}Aviso_de_privacidad.html" class="hover:underline">Aviso de Privacidad</a>
                <span class="text-gray-400">|</span>
                <a href="${toFolder}terminos.html" class="hover:underline">Términos y condiciones</a>
                <span class="text-gray-400">|</span>
                <a href="${toFolder}somos.html" class="hover:underline">Sobre nosotros</a>
            </div>
        </footer>

        <div class="fixed right-4 bottom-6 flex flex-col items-end gap-2 z-[3000]">
            <div class="flex flex-col gap-2 mb-1">
                <button id="btn-zoom-in" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 flex items-center justify-center">A+</button>
                <button id="btn-zoom-reset" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 text-xl flex items-center justify-center">↺</button>
                <button id="btn-zoom-out" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 flex items-center justify-center">A-</button>
                <button id="btn-contrast" class="w-10 h-10 bg-white border-2 border-[#2a9d8f] rounded-full shadow-md flex items-center justify-center text-lg mt-1">🌗</button>
            </div>

            <button id="btn-voz" 
                class="bg-[#2a9d8f] text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-bold text-sm hover:scale-105 transition-transform">
                🔊 Escuchar Contenido
            </button>
        </div>`;
    }
}
customElements.define('footer-component', Footer);