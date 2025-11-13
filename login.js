const API_URL = 'https://inventario-cocina-backend.onrender.com/api';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const password = document.getElementById('password').value;
    
    errorMessage.classList.remove('show');
    
    try {
        console.log('Intentando login con:', nombre);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al iniciar sesión');
        }
        
        const usuario = await response.json();
        console.log('Login exitoso:', usuario);
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('usuarioId', usuario.id);
        localStorage.setItem('usuarioNombre', usuario.nombre);
        
        // Redirigir a la aplicación principal
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error en login:', error);
        errorMessage.textContent = error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.';
        errorMessage.classList.add('show');
    }
});
