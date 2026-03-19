class Header extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot = currentPath.endsWith("index.html") || currentPath.endsWith("/");

    const folderPrefix = isInRoot ? "public/" : "";
    const toRoot = isInRoot ? "" : "../";
    const toFolder = isInRoot ? "public/" : "";

    const activeClass = "bg-unicafe-botones text-white px-4 py-2 rounded-full shadow-md";

    const active = (page) =>
      currentPath.includes(page) || (page === "index" && isInRoot) ? activeClass : "";

    // --- LÓGICA DE ROLES ---
    let rol = null;
    let nombreUsuario = "Invitado";

    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        rol = Number(user.rol) || Number(user.id_rol) || null;
        nombreUsuario = user.nombre || "Usuario";
      } else if (localStorage.getItem('rol')) {
        rol = Number(localStorage.getItem('rol'));
      }
    } catch (e) { console.error("Error leyendo la sesión", e); }

    // --- LÓGICA DE VISIBILIDAD DEL CARRITO ---
    const esPaginaVenta = currentPath.includes("menu.html") || currentPath.includes("productos.html");
    const esClienteOInvitado = !rol || rol === 3;
    let carritoHTML = "";

    // MODIFICACIÓN: Agregamos el HTML del botón del carrito con su ID
    if (esPaginaVenta && esClienteOInvitado) {
      carritoHTML = `
        <div id="carrito-header" class="relative cursor-pointer hover:scale-110 transition-transform flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 mr-2 sm:mr-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span id="cart-count" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#DDB885] text-[10px] font-bold text-[#7A5230] border-2 border-[#7A5230]">
                0
            </span>
        </div>
      `;
    }

    // --- CONSTRUCCIÓN DINÁMICA DEL MENÚ LATERAL ---
    let navLinksHTML = `
        <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("index")}"
           href="${toRoot}index.html"><span>🏠</span> HOME</a>
    `;

    
    if (!rol || rol === 3) {
      navLinksHTML += `
            <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("productos")}"
               href="${toFolder}productos.html"><span>⊞</span> PRODUCTOS</a>
            <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("menu")}"
               href="${toFolder}menu.html"><span>📄</span> MENÚ</a>
        `;
    }


    if (rol === 1 || rol === 2) {
      let gestionLinks = '';
      
      if (rol === 1) {
        gestionLinks += `
                <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("usuarios")}" href="${toFolder}usuarios.html">Usuarios</a>
                <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("empleados")}" href="${toFolder}empleados.html">Empleados</a>
            `;
      }

      gestionLinks += `
            <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("pedidos")}" href="${toFolder}pedidos.html">Pedidos</a>
            <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("reportes")}" href="${toFolder}reportes.html">Reportes</a>
            <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("gestion_productos")}" href="${toFolder}gestion_productos.html">Productos</a>
            <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("gestion_menu")}" href="${toFolder}gestion_menu.html">Menú</a>
        `;

      navLinksHTML += `
            <hr class="my-3 border-white/20"/>
            <div>
              <button id="toggle-gestion" class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white">
                <span class="flex items-center gap-3"><span>⚙️</span> GESTIÓN</span>
                <span id="arrow-gestion" class="text-xs transition-transform duration-200">›</span>
              </button>
              <div id="submenu-gestion" style="display:none; flex-direction:column;" class="gap-1 pl-8 pt-2">
                ${gestionLinks}
              </div>
            </div>
        `;
    }


    if (rol === 1) {
      navLinksHTML += `
            <div class="mt-1">
              <button id="toggle-info" class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white">
                <span class="flex items-center gap-3"><span>ℹ️</span> INFORMACIÓN</span>
                <span id="arrow-info" class="text-xs transition-transform duration-200">›</span>
              </button>
              <div id="submenu-info" style="display:none; flex-direction:column;" class="gap-1 pl-8 pt-2">
                <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("somos")}" href="${toFolder}gestion_somos.html">Somos</a>
                <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("terminos")}" href="${toFolder}gestion_terminos.html">Términos y condiciones</a>
                <a class="block px-4 py-2 rounded-full text-gray-300 transition-all hover:bg-unicafe-botones hover:text-white ${active("editar_aviso")}" href="${toFolder}editar_aviso.html">Aviso de privacidad</a>
              </div>
            </div>
        `;
    }

    if (rol) {
      navLinksHTML += `
            <hr class="my-3 border-white/20"/>
            <a class="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-unicafe-botones hover:text-white ${active("mi_cuenta")}"
               href="${toFolder}mi_cuenta.html">
               <span>👤</span> MI CUENTA
            </a>
        `;
    }

    const btnSesionLateral = rol
      ? `<button id="btn-logout-side" class="w-full flex items-center justify-between bg-unicafe-cancel text-white px-5 py-3 rounded-full font-bold text-sm transition-all hover:brightness-110 shadow-md"><span>← Cerrar Sesión</span></button>`
      : `<a href="${folderPrefix}login.html" class="flex items-center justify-between bg-unicafe-botones text-white px-5 py-3 rounded-full font-bold text-sm transition-all hover:brightness-110 shadow-md"><span>→ Iniciar Sesión</span><span>›</span></a>`;

    const btnSesionTop = rol
      ? `<button id="btn-logout-top" class="rounded-xl border border-white/40 bg-transparent px-5 py-2 font-bold text-white transition hover:bg-white/10 active:scale-95 shadow-sm hidden sm:block">Cerrar Sesión</button>`
      : `<a href="${folderPrefix}login.html" class="rounded-xl bg-white px-5 py-2 font-bold text-[#8C6844] transition hover:scale-105 active:scale-95 shadow-sm hidden sm:block">Iniciar Sesión</a>`;

    const enlaceAvatarLateral = rol
      ? `<a href="${toFolder}mi_cuenta.html" class="flex items-center justify-center rounded-full bg-white text-[#765433] w-10 h-10 shadow-inner overflow-hidden hover:scale-110 transition-transform cursor-pointer"><span class="text-xl">👤</span></a>`
      : `<div class="flex items-center justify-center rounded-full bg-white text-[#765433] w-10 h-10 shadow-inner overflow-hidden"><span class="text-xl">👤</span></div>`;

    const enlaceAvatarTop = rol
      ? `<a href="${toFolder}mi_cuenta.html" class="flex items-center justify-center rounded-full bg-white text-[#8C6844] w-10 h-10 shadow-inner hidden sm:flex hover:scale-110 transition-transform cursor-pointer"><span class="text-xl">👤</span></a>`
      : `<div class="flex items-center justify-center rounded-full bg-white text-[#8C6844] w-10 h-10 shadow-inner hidden sm:flex"><span class="text-xl">👤</span></div>`;

    // --- RENDERIZADO ---
    this.innerHTML = `
      <div id="nav-overlay" class="fixed inset-0 bg-black/60 transition-opacity duration-300" style="z-index: 999998; display: none; opacity: 0;"></div>
      
      <aside id="nav-drawer" class="fixed top-0 left-0 h-full w-64 bg-unicafe-header-dark shadow-2xl flex flex-col transition-transform duration-300 ease-in-out" style="z-index: 999999; transform: translateX(-100%);">
        <div class="flex items-center justify-between px-5 py-5 bg-unicafe-header shadow-sm border-b border-white/10">
          <div class="flex items-center gap-3">
            ${enlaceAvatarLateral}
            <div>
              <p class="font-bold text-white text-sm leading-tight line-clamp-1" title="${nombreUsuario}">${nombreUsuario}</p>
              <p class="text-xs text-unicafe-navbar uppercase">${rol === 1 ? 'ADMINISTRADOR' : rol === 2 ? 'EMPLEADO' : rol === 3 ? 'CLIENTE' : 'INVITADO'}</p>
            </div>
          </div>
          <button id="nav-close" class="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-lg">✕</button>
        </div>

        <nav class="flex flex-col gap-1 px-3 py-4 flex-1 text-sm font-semibold text-gray-100 overflow-y-auto">
          ${navLinksHTML}
        </nav>

        <div class="px-4 pb-6 border-t border-white/20 pt-5 flex flex-col gap-3 bg-black/10">
          ${btnSesionLateral}

        </div>
      </aside>

      <header class="sticky top-0 z-50 flex h-20 w-full items-center justify-between bg-unicafe-header text-white shadow-md px-6">
        <div class="flex items-center gap-3 flex-1">
          <button id="nav-hamburger" class="flex items-center justify-center w-10 h-10 rounded-lg border border-white/30 bg-white/10 text-2xl cursor-pointer">☰</button>
          ${enlaceAvatarTop}
          ${btnSesionTop}
        </div>
        <h1 class="text-xl md:text-3xl font-black uppercase tracking-widest whitespace-nowrap absolute left-1/2 -translate-x-1/2 pointer-events-none">CAFETERÍA UTHH</h1>
        <div class="flex items-center justify-end gap-4 flex-1">
            ${carritoHTML}
            <div class="hidden w-10 h-10 md:block"></div> 
        </div>
      </header>
    `;
    // --- Al final de connectedCallback en header.js ---
    setTimeout(() => {
        this.setupMenuEvents(); // Esto es para el menú lateral (hamburguesa)

        // FORZAR CONEXIÓN CON EL CARRITO
        const btnCarrito = document.getElementById('carrito-header');
        if (btnCarrito) {
            btnCarrito.onclick = (e) => {
                e.preventDefault();
                if (typeof Carrito !== 'undefined') {
                    console.log("Abriendo carrito...");
                    Carrito.init(); // Nos aseguramos que la interfaz esté inyectada
                    Carrito.toggle(true);
                } else {
                    console.error("El archivo carrito.js no se ha cargado correctamente.");
                }
            };
        }
    }, 100); // Aumentamos a 200ms para estar seguros
  }
  

  setupMenuEvents() {
    const hamburger = document.getElementById("nav-hamburger");
    const closeBtn = document.getElementById("nav-close");
    const drawer = document.getElementById("nav-drawer");
    const overlay = document.getElementById("nav-overlay");

    const openMenu = () => {
      drawer.style.transform = "translateX(0)";
      overlay.style.display = "block";
      setTimeout(() => (overlay.style.opacity = "1"), 10);
    };

    const closeMenu = () => {
      drawer.style.transform = "translateX(-100%)";
      overlay.style.opacity = "0";
      setTimeout(() => (overlay.style.display = "none"), 300);
    };

    if (hamburger) hamburger.onclick = openMenu;
    if (closeBtn) closeBtn.onclick = closeMenu;
    if (overlay) overlay.onclick = closeMenu;

    // Submenús Gestión/Info
    const toggleSub = (btnId, subId, arrowId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = () => {
                const sub = document.getElementById(subId);
                const arrow = document.getElementById(arrowId);
                const isOpen = sub.style.display === "flex";
                sub.style.display = isOpen ? "none" : "flex";
                arrow.style.transform = isOpen ? "" : "rotate(90deg)";
            };
        }
    };
    toggleSub("toggle-gestion", "submenu-gestion", "arrow-gestion");
    toggleSub("toggle-info", "submenu-info", "arrow-info");

    // Logout
    const logout = () => { localStorage.clear(); window.location.href = "index.html"; };
    if (document.getElementById("btn-logout-top")) document.getElementById("btn-logout-top").onclick = logout;
    if (document.getElementById("btn-logout-side")) document.getElementById("btn-logout-side").onclick = logout;
  }
}

customElements.define("header-component", Header);

class Footer extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isInRoot =
      currentPath.endsWith("index.html") || currentPath.endsWith("/");

    const toFolder = isInRoot ? "public/" : "";

    this.innerHTML = `
        <footer class="w-full bg-unicafe-header text-white p-8 mt-12 text-center shadow-inner">
            <p class="font-bold text-base mb-3">Universidad Tecnológica de la Huasteca Hidalguense</p>
            <p class="text-sm mb-4 text-unicafe-navbar">&copy; 2026 Cafetería UTHH. Todos los derechos reservados.</p>

            <div class="flex justify-center gap-4 text-xs font-semibold uppercase tracking-wider flex-wrap">
                <a href="${toFolder}Aviso_de_privacidad.html" class="hover:underline hover:text-unicafe-navbar transition-colors">Aviso de Privacidad</a>
                <span class="text-white/40 hidden sm:inline">|</span>
                <a href="${toFolder}terminos.html" class="hover:underline hover:text-unicafe-navbar transition-colors">Términos y condiciones</a>
                <span class="text-white/40 hidden sm:inline">|</span>
                <a href="${toFolder}somos.html" class="hover:underline hover:text-unicafe-navbar transition-colors">Sobre nosotros</a>
            </div>
        </footer>

        <div class="fixed right-4 bottom-6 flex flex-col items-end gap-2 z-[3000]">
            <div class="flex flex-col gap-2 mb-1">
                <button id="btn-zoom-in" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110">A+</button>
                <button id="btn-zoom-reset" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 text-xl flex items-center justify-center transition-transform hover:scale-110">↺</button>
                <button id="btn-zoom-out" class="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md font-bold text-unicafe-header-dark hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110">A-</button>
                <button id="btn-contrast" class="w-10 h-10 bg-white border-2 border-[#2a9d8f] rounded-full shadow-md flex items-center justify-center text-lg mt-1 transition-transform hover:scale-110">🌗</button>
            </div>

            <button id="btn-voz" 
                class="bg-[#2a9d8f] text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-bold text-sm hover:scale-105 transition-transform hover:bg-[#21867a]">
                🔊 Escuchar Contenido
            </button>
        </div>`;
  }
}
customElements.define("footer-component", Footer);