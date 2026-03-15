const loginForm = document.getElementById('loginForm');

const iniciarSesion = async (e) => {
    e.preventDefault();

    const email = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const btnSubmit = loginForm.querySelector('button[type="submit"]');

    if (!email || !password) {
        alert("Por favor complete todos los campos");
        return;
    }

    try {
        btnSubmit.textContent = "Verificando...";
        btnSubmit.disabled = true;

        const respuesta = await fetch('https://unicafe-api.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem('token', data.token);
            
            localStorage.setItem('usuarioNombre', data.usuario.nombre);
            localStorage.setItem('usuarioRol', data.usuario.rol);

            alert(`Bienvenido, ${data.usuario.nombre}`);

        } else {
            alert(data.message || 'Credenciales incorrectas');
        }

    } catch (error) {
        console.error('Error en el login: ', error);
        alert("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
        btnSubmit.textContent = "Entrar";
        btnSubmit.disabled = false;
    }
};

loginForm.addEventListener('submit', iniciarSesion);