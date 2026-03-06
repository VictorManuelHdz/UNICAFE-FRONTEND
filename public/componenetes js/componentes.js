class Header extends HTMLElement {
    connectedCallback() {
        // Detectar página actual para poner la clase 'is-active' automáticamente
        const currentPath = window.location.pathname;

        this.innerHTML = `
        <header class="flex h-20 items-center justify-between bg-unicafe-header text-white shadow-md">
    <div class="flex items-center gap-3">
    <div class="flex size-10 item-center justify-center rounded-full bg-gray-300 text-gray-700 w-10 h-10">
    <span class="text-2xl" >👤</span>
    </div>
    <a class="rounded-xl bg-white px-5 py-1.5 font-bold text-stone-900 underline-offset-2 transition-transform hover:scale-105 active:scale-96" 
    href="login.html">Iniciar Sesión</a>

    </div>
    <h1 class="text-3xl font-black uppercase">CAFETERIA UTHH</h1>
    <div class="hidden w-48 md:block"></div>
    </header>
    `;
    }
}
customElements.define('header-component', Header);

class NavSecundario extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        
        // Función para verificar qué botón debe estar activo
        const activeClass = (page) => 
            (currentPath.includes(page) || (page === 'index' && (currentPath.endsWith('/') || currentPath.includes('index')))) 
            ? 'is-active' : '';

        this.innerHTML = `
        <nav class="bg-unicafe-navbar py-4 border-b border-unicafe-border/30">
          <div class="container mx-auto flex items-center px-4">
            <button class="text-2xl text-stone-700 hover:text-stone-900 md:hidden" id="btnMenu">☰</button>
            
            <div class="flex flex-1 flex-wrap justify-center gap-4" id="menuEnlaces">
                <a class="pill ${activeClass('index')}" href="index.html">
                    HOME <span class="ico">🏠</span>
                </a>
                <a class="pill ${activeClass('productos')}" href="productos.html">
                    PRODUCTOS <span class="ico">📦</span>
                </a>
                <a class="pill ${activeClass('menu')}" href="menu.html">
                    MENÚ <span class="ico">🍽️</span>
                </a>
                <a class="pill ${activeClass('pedidos')}" href="pedidos.html">
                    PEDIDOS <span class="ico"> </span>
                </a>
                <a class="pill ${activeClass('terminos')}" href="terminos.html">
                    TÉRMINOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('aviso')}" href="aviso_de_privacidad.html">
                    AVISO <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('somos')}" href="somos.html">
                    SOMOS <span class="ico">⚙️</span>
                </a>
                <a class="pill ${activeClass('registro')}" href="registro.html">
                    REGISTROS <span class="ico">⚙️</span>
                </a>
            </div>
          </div>
        </nav>`;
    }
}
customElements.define('nav-secundario', NavSecundario);