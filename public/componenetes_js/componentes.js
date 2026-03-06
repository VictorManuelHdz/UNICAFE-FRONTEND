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
                <a class="pill ${activeClass('productos')}" href="${toFolder}gestion_productos.html">
                    PRODUCTOS <span class="ico">📦</span>
                </a>
                <a class="pill ${activeClass('menu')}" href="${toFolder}menu.html">
                    MENÚ <span class="ico">🍽️</span>
                </a>
                <a class="pill ${activeClass('pedidos')}" href="${toFolder}pedidos.html">
                    PEDIDOS <span class="ico">📋</span>
                </a>
                <a class="pill ${activeClass('terminos')}" href="${toFolder}gestion_terminos.html">
                    TÉRMINOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('avisos')}" href="${toFolder}Aviso_de_privacidad.html">
                    AVISO <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('somos')}" href="${toFolder}gestion_somos.html">
                    SOMOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('usuario')}" href="${toFolder}usuarios.html">
                    REGISTROS <span class="ico">👤</span>
                </a>
            </div>
          </div>
        </nav>`;
    }
}
customElements.define('nav-secundario', NavSecundario);