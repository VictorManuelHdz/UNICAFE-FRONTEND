// carrito.js corregido y blindado
const Carrito = {
    productos: JSON.parse(localStorage.getItem('carrito_uthh')) || [],

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

        // Insertar al final del body
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
        if (this.productos.length === 0) return alert("Tu carrito está vacío.");

        // 1. Verificar sesión
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            alert("Por favor, inicia sesión para confirmar tu pedido.");
            window.location.href = 'login.html';
            return;
        }

        const usuario = JSON.parse(usuarioStr);
        const total = this.productos.reduce((acc, p) => acc + p.subtotal, 0);

        const payload = {
            idUsuario: usuario.id || usuario.intIdUsuario,
            total: total,
            notas: "Pedido desde la web", 
            carrito: this.productos
        };

        try {
            const btn = document.getElementById('btn-confirmar-pedido');
            const originalText = btn.innerHTML;
            btn.innerHTML = "Procesando...";
            btn.disabled = true;

            const respuesta = await fetch('https://unicafe-api.vercel.app/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await respuesta.json();

            if (!respuesta.ok) throw new Error(data.message || "Error al procesar el pedido");

            alert(`¡Pedido confirmado! Tu número de folio es: ${data.folio}`);
            this.productos = []; 
            this.saveAndSync();
            this.toggle(false);

        } catch (error) {
            console.error(error);
            alert("Hubo un problema al enviar tu pedido. Intenta de nuevo.");
        } finally {
            const btn = document.getElementById('btn-confirmar-pedido');
            if (btn) {
                btn.innerHTML = "Confirmar Pedido";
                btn.disabled = false;
            }
        }
    },

    eliminar(index) {
        this.productos.splice(index, 1);
        this.saveAndSync();
    },

    vaciar() {
        if (confirm("¿Estás seguro de que quieres vaciar tu pedido?")) {
            this.productos = [];
            this.saveAndSync();
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