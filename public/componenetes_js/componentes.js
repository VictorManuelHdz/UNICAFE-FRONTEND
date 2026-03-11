class Header extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot =
      currentPath.endsWith("index.html") || currentPath.endsWith("/");

    const folderPrefix = isInRoot ? "public/" : "";

    this.innerHTML = `
        <header class="flex h-20 items-center justify-between bg-unicafe-header text-white shadow-md px-6">
            
            <div class="flex items-center gap-3">
                <div class="flex items-center justify-center rounded-full bg-gray-300 text-gray-700 w-10 h-10">
                    <span class="text-xl">👤</span>
                </div>

                <a class="rounded-xl bg-white px-5 py-1.5 font-bold text-stone-900 transition hover:scale-105 active:scale-95"
                   href="${folderPrefix}login.html">
                   Iniciar Sesión
                </a>
            </div>

            <h1 class="text-3xl font-black uppercase tracking-widest">
                CAFETERIA UTHH
            </h1>

            <div class="hidden w-48 md:block"></div>

        </header>`;
  }
}

customElements.define("header-component", Header);

class NavSecundario extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot = currentPath.endsWith("index.html") || currentPath.endsWith("/");

    const toRoot = isInRoot ? "" : "../";
    const toFolder = isInRoot ? "public/" : "";

    const activeClass = "bg-unicafe-botones text-white px-4 py-2 rounded-full";
    
    const active = (page) =>
      currentPath.includes(page) || (page === "index" && isInRoot)
        ? activeClass
        : "";

    this.innerHTML = `
      <nav class="bg-unicafe-navbar shadow-md relative z-[9999]">
        <div class="max-w-6xl mx-auto flex justify-center gap-12 py-4 text-sm font-semibold text-gray-800 items-center">
          
          <a class="transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full ${active("index")}" 
             href="${toRoot}index.html">
            HOME 
          </a>

          <div class="relative group">
            <button class="flex items-center gap-1 transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full ${active("productos")}">
              PRODUCTOS
              <span class="text-xs">▾</span>
            </button>
            
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56
            opacity-0 invisible pointer-events-none
            group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
            transition-all duration-200 z-[10000]">

              <div class="bg-unicafe-navbar rounded-2xl shadow-xl p-2 border border-gray-100 flex flex-col gap-1">
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white" 
                   href="${toFolder}productos.html?cat=cafe">
                   Comidas
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white" 
                   href="${toFolder}productos.html?cat=bebidas">
                   Bebidas
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white" 
                   href="${toFolder}productos.html?cat=reposteria">
                   Snacks
                </a>
              </div>
            </div>
          </div>

          <a class="transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full ${active("menu")}" 
             href="${toFolder}menu.html">
            MENÚ
          </a>

          <a class="transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full ${active("pedidos")}" 
             href="${toFolder}pedidos.html">
            PEDIDOS
          </a>

          <div class="relative group">
            <button class="flex items-center gap-1 transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full">
              GESTIÓN 
              <span class="text-xs">▾</span>
            </button>
            
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56
            opacity-0 invisible pointer-events-none
            group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
            transition-all duration-200 z-[10000]">

              <div class="bg-unicafe-navbar rounded-2xl shadow-xl p-2 border border-gray-100 flex flex-col gap-1">
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("usuarios")}" 
                   href="${toFolder}usuarios.html">
                  Usuarios
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("pedidos")}" 
                   href="${toFolder}pedidos.html">
                  Pedidos
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("reportes")}" 
                   href="${toFolder}reportes.html">
                  Reportes
                </a>
              </div>
            </div>
          </div>

          <div class="relative group">
            <button class="flex items-center gap-1 transition-all duration-200 hover:bg-unicafe-botones hover:text-white hover:-translate-y-1 hover:scale-105 px-4 py-2 rounded-full">
              INFORMACIÓN ADICIONAL
              <span class="text-xs">▾</span>
            </button>
            
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56
            opacity-0 invisible pointer-events-none
            group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
            transition-all duration-200 z-[10000]">

              <div class="bg-unicafe-navbar rounded-2xl shadow-xl p-2 border border-gray-100 flex flex-col gap-1">
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("somos")}" 
                   href="${toFolder}gestion_somos.html">
                  Somos
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("terminos")}" 
                   href="${toFolder}gestion_terminos.html">
                  Términos y condiciones
                </a>
                <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("privacidad")}" 
                   href="${toFolder}Aviso_de_privacidad.html">
                  Aviso de privacidad
                </a>
              </div>
            </div>
          </div>

        </div>
      </nav>
    `;
  }
}
customElements.define("nav-secundario", NavSecundario);

class Footer extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot =
      currentPath.endsWith("index.html") || currentPath.endsWith("/");

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
customElements.define("footer-component", Footer);
