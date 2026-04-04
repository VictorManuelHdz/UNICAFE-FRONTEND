window.manejarRespuestaSeguridad = (respuesta) => {
    if (respuesta.status === 401 || respuesta.status === 403) {
        alert("⚠️ SEGURIDAD: Se ha detectado una alteración o expiración en la sesión. Su acceso ha sido revocado.");
        
        localStorage.clear();
        
        const currentPath = window.location.pathname;
        if (currentPath.includes('/public/')) {
            window.location.href = 'login.html'; 
        } else {
            window.location.href = '../public/login.html';
        }
        
        throw new Error("Sesión invalidada por seguridad.");
    }
    return respuesta;
};