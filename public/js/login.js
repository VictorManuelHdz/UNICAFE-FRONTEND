const loginForm = document.getElementById('loginForm');
const btnSubmit = document.getElementById('btnSubmit');
const mensajeAlerta = document.getElementById('mensajeAlerta');

const spinnerHTML = `<svg class="animate-spin h-5 w-5 text-[#0e3a23]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>`;

const mostrarError = (mensaje) => {
    mensajeAlerta.textContent = mensaje;
    mensajeAlerta.classList.remove('hidden');
    
    setTimeout(() => {
        mensajeAlerta.classList.add('hidden');
    }, 4000);
};

const iniciarSesion = async (e) => {
    e.preventDefault();

    const email = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        mostrarError("Por favor complete todos los campos");
        return;
    }

    try {
        // Arranca el spinner y bloquea el botón
        btnSubmit.innerHTML = spinnerHTML;
        btnSubmit.disabled = true;

        const respuesta = await fetch('https://unicafe-api.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Guardamos la sesión
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('rol', data.usuario.rol);

            // REDIRECCIÓN INMEDIATA
            window.location.href = '../index.html';

        } else {
            // Si las credenciales son incorrectas
            mostrarError(data.message || 'Credenciales incorrectas');
            
            // Regresamos el botón a la normalidad
            btnSubmit.innerHTML = "Entrar";
            btnSubmit.disabled = false;
        }

    } catch (error) {
        console.error('Error en el login: ', error);
        mostrarError("Error de conexión. Inténtalo más tarde.");
        
        btnSubmit.innerHTML = "Entrar";
        btnSubmit.disabled = false;
    }
};

loginForm.addEventListener('submit', iniciarSesion);