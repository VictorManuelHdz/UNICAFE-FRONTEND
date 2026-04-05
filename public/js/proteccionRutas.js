const protegerVistaAdmin = () => {
    const usuarioStr = localStorage.getItem('usuario');
    
    // Si no hay sesión iniciada, lo mandamos al login
    if (!usuarioStr) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(usuarioStr);
    const rol = Number(user.rol) || Number(user.id_rol);

    // Si el rol es 3 (Cliente), LO REDIRIGIMOS AL HOME (Paso 2 del documento)
    if (rol === 3) {
        alert("Acceso denegado: Área exclusiva de administración.");
        
        // Redirección al Home
        const currentPath = window.location.pathname;
        if (currentPath.includes('/public/')) {
            window.location.href = '../index.html'; 
        } else {
            window.location.href = 'index.html';
        }
    }
};

protegerVistaAdmin();