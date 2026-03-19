// carrito.js
const Carrito = {
    productos: JSON.parse(localStorage.getItem('carrito_uthh')) || [],

    init() {
        if (!document.getElementById('side-cart')) {
            const cartHTML = `
                <div id="cart-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:999998;"></div>
                <div id="side-cart" style="position:fixed; top:0; right:0; width:350px; h-full; background:#1a0f0a; color:white; z-index:999999; transform:translateX(100%); transition:0.3s; height:100vh; display:flex; flex-direction:column; box-shadow:-5px 0 15px rgba(0,0,0,0.5);">
                    <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:1.2rem;">🛒 MI PEDIDO</h2>
                        <button id="close-cart-btn" style="background:none; border:none; color:white; cursor:pointer; font-size:1.5rem;">✕</button>
                    </div>
                    <div id="cart-items-container" style="flex:1; overflow-y:auto; padding:20px;"></div>
                    <div style="padding:20px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.1);">
                        <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:bold; margin-bottom:15px;">
                            <span>Total</span>
                            <span id="cart-total-price" style="color:#DDB885;">$0</span>
                        </div>
                        <button style="width:100%; padding:15px; background:#a66d3f; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">✓ Realizar pedido</button>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', cartHTML);
            
            // Eventos
            document.getElementById('close-cart-btn').onclick = () => this.toggle(false);
            document.getElementById('cart-overlay').onclick = () => this.toggle(false);
        }
        this.render();
    },

    // En carrito.js, dentro de toggle(show)
    toggle(show) {
        const cart = document.getElementById('side-cart');
        const overlay = document.getElementById('cart-overlay');
        
        if (!cart || !overlay) {
            // Si por alguna razón no existen, los creamos de nuevo
            this.init();
            return this.toggle(show);
        }

        if (show) {
            overlay.style.display = 'block';
            cart.style.display = 'flex'; // Asegurar que sea flex
            setTimeout(() => {
                overlay.style.opacity = '1';
                cart.style.transform = 'translateX(0)';
            }, 10);
        } else {
            cart.style.transform = 'translateX(100%)';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                cart.style.display = 'none';
            }, 300);
        }
    },

    render() {
        const container = document.getElementById('cart-items-container');
        const badge = document.getElementById('cart-count');
        const totalLabel = document.getElementById('cart-total-price');
        
        if (!container) return;

        container.innerHTML = this.productos.length === 0 
            ? '<p style="text-align:center; color:gray; margin-top:50px;">Tu carrito está vacío</p>'
            : this.productos.map((p, i) => `
                <div style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:10px;">
                    <img src="${p.imagen}" style="width:50px; height:50px; border-radius:5px; object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:0.9rem;">${p.nombre}</div>
                        <div style="color:#DDB885; font-size:0.8rem;">$${p.precio}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="Carrito.modificar(${i}, -1)" style="width:25px; height:25px; border-radius:50%; border:none; background:#333; color:white; cursor:pointer;">-</button>
                        <span>${p.cantidad}</span>
                        <button onclick="Carrito.modificar(${i}, 1)" style="width:25px; height:25px; border-radius:50%; border:none; background:#333; color:white; cursor:pointer;">+</button>
                    </div>
                </div>`).join('');

        const total = this.productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const count = this.productos.reduce((acc, p) => acc + p.cantidad, 0);

        if (totalLabel) totalLabel.innerText = `$${total.toFixed(2)}`;
        if (badge) badge.innerText = count;
    },

    modificar(index, valor) {
        this.productos[index].cantidad += valor;
        if (this.productos[index].cantidad <= 0) this.productos.splice(index, 1);
        localStorage.setItem('carrito_uthh', JSON.stringify(this.productos));
        this.render();
    }
};