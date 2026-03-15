const loginForm = document.getElementById('loginForm')

const iniciarSesion = async (e)=>{
    e.preventDefault()

    const email = document.getElementById('usuario').value
    const password =document.getElementById('password').value

    if(!email||!password){
        alert("Por favor complete todos los campos")
        return
    }
    try {
        const respuesta = await fetch('http://localhost:3000/api/auth/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })
        
        const data = await respuesta.json()
            if (respuesta.ok) {
                localStorage.setItem('token', data.token)
                alert(`Bienvenido, ${data.usuario.nombre}`)
                window.location.href='../index.html'
            }
            else
            {
                alert(data.message ||'credenciales incorrectas')
            }
        

    } catch (error) {
        console.error('Error en el login: ',error)
        alert("No se pudo conectar con el servidor")
    }
    
}

loginForm.addEventListener('submit', iniciarSesion)