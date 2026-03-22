const Carrito = {
    productos: JSON.parse(localStorage.getItem('carrito_uthh')) || [],

    mostrarToast(mensaje, tipo = 'exito') {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'fixed bottom-6 right-6 z-[100000] transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-bold';
            toast.innerHTML = `<span id="toast-icon" class="text-2xl"></span><span id="toast-message"></span>`;
            document.body.appendChild(toast);
        }

        toast.querySelector('#toast-message').textContent = mensaje;
        toast.classList.remove('bg-[#2A9D8F]', 'bg-[#e76f51]');

        if (tipo === 'exito') {
            toast.classList.add('bg-[#2A9D8F]');
            toast.querySelector('#toast-icon').textContent = '✅';
        } else {
            toast.classList.add('bg-[#e76f51]');
            toast.querySelector('#toast-icon').textContent = '⚠️';
        }

        toast.classList.remove('translate-y-10', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-10', 'opacity-0');
        }, 3000);
    },

    mostrarConfirmacion(mensaje) {
        return new Promise((resolve) => {
            let modal = document.getElementById('carrito-modal-confirmacion');
            
            if (!modal) {
                const modalHTML = `
                <div id="carrito-modal-confirmacion" class="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4 opacity-0 transition-opacity duration-300">
                    <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-95 transition-transform duration-300" id="carrito-modal-caja">
                        <div class="text-[#a66d3f] text-5xl mb-4">🛒</div>
                        <h3 class="text-2xl font-black text-gray-800 mb-2">¿Estás seguro?</h3>
                        <p class="text-gray-500 mb-8 text-sm" id="carrito-modal-mensaje"></p>
                        <div class="flex gap-3 justify-center">
                            <button id="carrito-btn-cancelar" class="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors w-full">Cancelar</button>
                            <button id="carrito-btn-confirmar" class="px-5 py-2.5 rounded-lg bg-[#a66d3f] text-white font-bold hover:bg-[#bc7d4d] transition-colors shadow-sm w-full">Sí, vaciar</button>
                        </div>
                    </div>
                </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                modal = document.getElementById('carrito-modal-confirmacion');
            }

            const caja = document.getElementById('carrito-modal-caja');
            document.getElementById('carrito-modal-mensaje').textContent = mensaje;

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                caja.classList.remove('scale-95');
            }, 10);

            const cerrarYResolver = (resultado) => {
                modal.classList.add('opacity-0');
                caja.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                    resolve(resultado);
                }, 300);
            };

            document.getElementById('carrito-btn-cancelar').onclick = () => cerrarYResolver(false);
            document.getElementById('carrito-btn-confirmar').onclick = () => cerrarYResolver(true);
        });
    },

    init() {
        // Bloqueo de duplicados
        if (document.getElementById('side-cart')) return;

        const cartHTML = `
            <div id="cart-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] hidden transition-opacity duration-300 opacity-0"></div>
            
            <div id="side-cart" class="fixed top-0 right-0 w-[350px] h-screen bg-[#664836] text-white z-[10001] translate-x-full transition-transform duration-300 flex flex-col shadow-2xl">
                <div class="p-5 border-b border-white/10 flex justify-between items-center bg-black/10">
                    <h2 class="text-lg font-bold">🛒 MI PEDIDO</h2>
                    <button id="close-cart-btn" class="text-2xl hover:text-gray-400 transition-colors">✕</button>
                </div>

                <div id="cart-items-container" class="flex-1 overflow-y-auto p-5 space-y-4"></div>
                
                <div class="p-5 bg-black/20 border-t border-white/10">
                    <div class="flex justify-between items-center text-xl font-bold mb-4 px-1">
                        <span>Total</span>
                        <span id="cart-total-price" class="text-[#DDB885] font-mono">$0.00</span>
                    </div>
                    
                    <button onclick="Carrito.vaciar()" 
                        class="w-full mb-4 py-3 text-sm font-medium text-[#DDB885] bg-black/40 border border-[#DDB885]/20 rounded-xl
                            hover:bg-[#85644f] hover:border-[#DDB885]/40 
                            active:scale-[0.97] transition-all duration-300 
                            flex items-center justify-center gap-2 shadow-lg group">
                        
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Vaciar carrito</span>
                    </button>
                    
                    <button class="w-full py-4 bg-[#a66d3f] hover:bg-[#bc7d4d] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95" id="btn-confirmar-pedido" onclick="Carrito.enviarPedido()">
                        Confirmar Pedido
                    </button>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', cartHTML);

        document.getElementById('close-cart-btn').onclick = () => this.toggle(false);
        document.getElementById('cart-overlay').onclick = () => this.toggle(false);

        this.render();
    },

    toggle(show) {
        const cart = document.getElementById('side-cart');
        const overlay = document.getElementById('cart-overlay');

        if (!cart || !overlay) return;

        if (show) {
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.add('opacity-100');
                cart.classList.remove('translate-x-full');
                cart.classList.add('translate-x-0');
            }, 10);
        } else {
            overlay.classList.remove('opacity-100');
            cart.classList.remove('translate-x-0');
            cart.classList.add('translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    },

    agregar(id, tipo, nombre, precio, imagen) {
        this.init();

        const existe = this.productos.find(p => p.id === id && p.tipo === tipo);
        if (existe) {
            existe.cantidad++;
            existe.subtotal = existe.cantidad * existe.precio;
        } else {
            this.productos.push({
                id,
                tipo,
                nombre,
                precio: parseFloat(precio),
                subtotal: parseFloat(precio),
                imagen,
                cantidad: 1
            });
        }

        this.saveAndSync();
        this.toggle(true);
        //!this.mostrarToast(`${nombre} agregado al carrito`, 'exito'); nose si es buena idea mostrar un toast cada vez que se agrega algo al carrito, 
        //!puede resultar molesto si el usuario quiere agregar varios productos seguidos. 
        //!Mejor dejar que el usuario vea el cambio directamente en el carrito sin interrumpir su flujo con notificaciones constantes.
    },

    modificar(index, valor) {
        this.productos[index].cantidad += valor;
        if (this.productos[index].cantidad <= 0) {
            this.eliminar(index);
        } else {
            this.productos[index].subtotal = this.productos[index].cantidad * this.productos[index].precio;
            this.saveAndSync();
        }
    },

    async enviarPedido() {
        if (this.productos.length === 0) {
            return this.mostrarToast("Tu carrito está vacío", "error");
        }

        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            this.mostrarToast("Por favor, inicia sesión para realizar tu compra", "error");
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const btn = document.getElementById('btn-confirmar-pedido');
        try {
            btn.innerHTML = "Iniciando pago...";
            btn.disabled = true;

            const respuesta = await fetch('https://unicafe-api.vercel.app/api/pagos/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productos: this.productos
                })
            });
            const data = await respuesta.json();
            
            if (!respuesta.ok) throw new Error(data.message || "Error al conectar con el servidor");
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No se recibió la URL de pago.");
            }
        } catch (error) {
            console.error(error);
            this.mostrarToast("No se pudo iniciar el proceso de pago. Intente de nuevo.", "error");
            btn.innerHTML = "Confirmar Pedido";
            btn.disabled = false;
        }
    },

    eliminar(index) {
        this.productos.splice(index, 1);
        this.saveAndSync();
    },

    async vaciar() {
        const confirmado = await this.mostrarConfirmacion("¿Estás seguro de que quieres vaciar tu pedido? Todos los artículos se eliminarán.");
        if (confirmado) {
            this.productos = [];
            this.saveAndSync();
            this.mostrarToast("El carrito ha sido vaciado", "exito");
            this.toggle(false); // Cierra el carrito automáticamente
        }
    },

    saveAndSync() {
        localStorage.setItem('carrito_uthh', JSON.stringify(this.productos));
        this.render();
    },

    render() {
        const container = document.getElementById('cart-items-container');
        const badge = document.getElementById('cart-count');
        const totalLabel = document.getElementById('cart-total-price');

        if (!container) return;

        if (this.productos.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center mt-20 opacity-30 text-white">
                    <span class="text-6xl mb-4">🛒</span>
                    <p class="text-lg">Tu carrito está vacío</p>
                </div>`;
        } else {
            container.innerHTML = this.productos.map((p, i) => `
            <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <img src="${p.imagen}" class="w-14 h-14 rounded-lg object-cover shrink-0">
                
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold truncate">${p.nombre}</h4>
                    <p class="text-[#DDB885] font-bold text-xs">$${(p.precio * p.cantidad).toFixed(2)}</p>
                </div>

                <div class="flex items-center gap-2">
                    <div class="flex items-center bg-black/30 rounded-full h-9 px-1 border border-white/5 shadow-inner">
                        <button onclick="Carrito.modificar(${i}, -1)" 
                            class="w-7 h-7 flex items-center justify-center text-xl font-light text-white/60 hover:text-white transition-colors">
                            −
                        </button>
                        
                        <span class="w-6 text-center text-xs font-bold text-white">
                            ${p.cantidad}
                        </span>
                        
                        <button onclick="Carrito.modificar(${i}, 1)" 
                            class="w-7 h-7 flex items-center justify-center text-xl font-light text-white/60 hover:text-white transition-colors">
                            +
                        </button>
                    </div>
                    
                    <button onclick="Carrito.eliminar(${i})" 
                        class="w-8 h-8 flex items-center justify-center text-2xl font-light text-white/30 hover:text-red-400 transition-colors" title="Eliminar">
                        ✕
                    </button>
                </div>
            </div>`).join('');
        }

        const total = this.productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const count = this.productos.reduce((acc, p) => acc + p.cantidad, 0);

        if (totalLabel) totalLabel.innerText = `$${total.toFixed(2)}`;
        if (badge) badge.innerText = count;
    }
};

document.addEventListener('DOMContentLoaded', () => Carrito.init());