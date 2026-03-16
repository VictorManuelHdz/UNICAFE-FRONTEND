class Header extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot =
      currentPath.endsWith("index.html") || currentPath.endsWith("/");

    const folderPrefix = isInRoot ? "public/" : "";
    const toRoot = isInRoot ? "" : "../";
    const toFolder = isInRoot ? "public/" : "";

    const activeClass = "bg-unicafe-botones text-white px-4 py-2 rounded-full";

    const active = (page) =>
      currentPath.includes(page) || (page === "index" && isInRoot)
        ? activeClass
        : "";

    this.innerHTML = `

      <div id="nav-overlay"
           class="fixed inset-0 bg-black/50 transition-opacity duration-300"
           style="z-index: 999998; display: none; opacity: 0;">
      </div>

      <aside id="nav-drawer"
             class="fixed top-0 left-0 h-full w-64 bg-unicafe-navbar shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
             style="z-index: 999999; transform: translateX(-100%);">

        <div class="flex items-center justify-between px-5 py-5 bg-unicafe-header">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center rounded-full bg-gray-300 text-gray-700 w-10 h-10">
              <span class="text-xl">👤</span>
            </div>
            <div>
              <p class="font-bold text-white text-sm leading-tight">Cafetería UTHH</p>
              <p class="text-xs text-gray-300">NAVEGACIÓN</p>
            </div>
          </div>
          <button id="nav-close"
                  class="flex items-center justify-center w-8 h-8 rounded-full
                         bg-white/20 hover:bg-white/40 text-white font-bold text-lg
                         transition-all cursor-pointer">
            ✕
          </button>
        </div>

        <nav class="flex flex-col gap-1 px-3 py-4 flex-1 text-sm font-semibold text-gray-800">
          <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("index")}"
             href="${toRoot}index.html"><span>🏠</span> HOME</a>
          <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("productos")}"
             href="${toFolder}productos.html"><span>⊞</span> PRODUCTOS</a>
          <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("menu")}"
             href="${toFolder}menu.html"><span>📄</span> MENÚ</a>
          <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("gestion_productos")}"
             href="${toFolder}gestion_productos.html"><span>⊞</span> PRODUCTOS</a>
          <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("gestion_menu")}"
             href="${toFolder}gestion_menu.html"><span>📄</span> MENÚ</a>

          <hr class="my-2 border-gray-300"/>

          <div>
            <button id="toggle-gestion"
                    class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white">
              <span class="flex items-center gap-3"><span>⚙️</span> GESTIÓN</span>
              <span id="arrow-gestion" class="text-xs">›</span>
            </button>
            <div id="submenu-gestion" style="display:none; flex-direction:column;" class="gap-1 pl-8 pt-1">
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("usuarios")}"
                href="${toFolder}usuarios.html">Usuarios</a>
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("empleados")}"
                href="${toFolder}empleados.html">Empleados</a>
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("pedidos")}"
                href="${toFolder}pedidos.html">Pedidos</a>
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("reportes")}"
                href="${toFolder}reportes.html">Reportes</a>
            </div>
          </div>

          <div>
            <button id="toggle-info"
                    class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white">
              <span class="flex items-center gap-3"><span>ℹ️</span> INFORMACIÓN ADICIONAL</span>
              <span id="arrow-info" class="text-xs">›</span>
            </button>
            <div id="submenu-info" style="display:none; flex-direction:column;" class="gap-1 pl-8 pt-1">
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("somos")}"
                 href="${toFolder}gestion_somos.html">Somos</a>
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("terminos")}"
                 href="${toFolder}gestion_terminos.html">Términos y condiciones</a>
              <a class="block px-4 py-2 rounded-full text-gray-700 transition-all hover:bg-unicafe-botones hover:text-white ${active("privacidad")}"
                 href="${toFolder}Aviso_de_privacidad.html">Aviso de privacidad</a>
            </div>
          </div>
        </nav>

        <div class="px-3 pb-5 border-t border-gray-200 pt-4 flex flex-col gap-2">
          <a href="${folderPrefix}login.html"
             class="flex items-center justify-between bg-unicafe-botones text-white px-4 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90">
            <span>→ Iniciar Sesión</span><span>›</span>
          </a>
          <div class="text-xs text-gray-500 px-2 mt-1">
            <p class="font-semibold text-gray-700">Cafeteria UTHH</p>
            <p>Lun-Vie · 7:00 – 18:00</p>
            <p>Edificio principal, planta baja</p>
          </div>
        </div>

      </aside>

      <header class="flex h-20 items-center justify-between bg-unicafe-header text-white shadow-md px-6"
              style="position: absolute; top: 0; left: 0; right: 0; z-index: 100;">

        <div class="flex items-center gap-3">
          <button id="nav-hamburger"
                  class="flex items-center justify-center w-10 h-10 rounded-lg border border-white bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer text-2xl"
                  aria-label="Abrir menú">
            ☰
          </button>

          <div class="flex items-center justify-center rounded-full bg-gray-300 text-gray-700 w-10 h-10">
            <span class="text-xl">👤</span>
          </div>

          <a class="rounded-xl bg-white px-5 py-1.5 font-bold text-stone-900 transition hover:scale-105 active:scale-95"
             href="${folderPrefix}login.html">
            Iniciar Sesión
          </a>
        </div>

        <h1 class="text-3xl font-black uppercase tracking-widest whitespace-nowrap
                   absolute left-1/2 -translate-x-1/2 pointer-events-none">
          CAFETERIA UTHH
        </h1>

        <div class="hidden w-48 md:block"></div>

      </header>
    `;

    const hamburger = document.getElementById("nav-hamburger");
    const closeBtn = document.getElementById("nav-close");
    const drawer = document.getElementById("nav-drawer");
    const overlay = document.getElementById("nav-overlay");

    const openDrawer = () => {
      drawer.style.transform = "translateX(0)";
      overlay.style.display = "block";
      setTimeout(() => { overlay.style.opacity = "1"; }, 10);
    };

    const closeDrawer = () => {
      drawer.style.transform = "translateX(-100%)";
      overlay.style.opacity = "0";
      setTimeout(() => { overlay.style.display = "none"; }, 300);
    };

    hamburger.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    const toggleSubmenu = (btnId, submenuId, arrowId) => {
      const btn = document.getElementById(btnId);
      const submenu = document.getElementById(submenuId);
      const arrow = document.getElementById(arrowId);
      btn.addEventListener("click", () => {
        const isOpen = submenu.style.display === "flex";
        submenu.style.display = isOpen ? "none" : "flex";
        arrow.style.transform = isOpen ? "" : "rotate(90deg)";
      });
    };

    toggleSubmenu("toggle-gestion", "submenu-gestion", "arrow-gestion");
    toggleSubmenu("toggle-info", "submenu-info", "arrow-info");
  }
}

customElements.define("header-component", Header);
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
