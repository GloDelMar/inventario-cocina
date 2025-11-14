// ============================================
// GESTIÓN DE DATOS Y API
// v2.0 - Multi-user authentication system
// ============================================

// Verificar autenticación al cargar la página
const usuarioId = localStorage.getItem('usuarioId');
const usuarioNombre = localStorage.getItem('usuarioNombre');

if (!usuarioId || !usuarioNombre) {
    window.location.href = 'login.html';
    throw new Error('No autenticado'); // Detener ejecución
}

// Mostrar nombre del usuario
document.getElementById('usuarioNombre').textContent = usuarioNombre;

// Botón de logout
document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        window.location.href = 'login.html';
    }
});

const API_URL = 'https://inventario-cocina-backend.onrender.com/api';

let ingredientes = [];
let recetas = [];
let ingredienteEditando = null;
let recetaEditando = null;
let ingredientesRecetaTemp = [];

// ============================================
// TABLA DE EQUIVALENCIAS DE UNIDADES
// ============================================
const EQUIVALENCIAS = {
    // Conversiones a gramos (para ingredientes en kg, g)
    'taza-g': { factor: 240, ingredienteUnidad: 'g' },      // 1 taza = 240g (harina promedio)
    'kg-g': { factor: 1000, ingredienteUnidad: 'g' },        // 1 kg = 1000g
    'cucharada-g': { factor: 15, ingredienteUnidad: 'g' },   // 1 cucharada = 15g
    'cucharadita-g': { factor: 5, ingredienteUnidad: 'g' },  // 1 cucharadita = 5g
    
    // Conversiones a mililitros (para ingredientes en l, ml)
    'taza-ml': { factor: 240, ingredienteUnidad: 'ml' },     // 1 taza = 240ml
    'l-ml': { factor: 1000, ingredienteUnidad: 'ml' },       // 1 litro = 1000ml
    'cucharada-ml': { factor: 15, ingredienteUnidad: 'ml' }, // 1 cucharada = 15ml
    'cucharadita-ml': { factor: 5, ingredienteUnidad: 'ml' },// 1 cucharadita = 5ml
    
    // Unidades iguales (sin conversión)
    'g-g': { factor: 1, ingredienteUnidad: 'g' },
    'kg-kg': { factor: 1, ingredienteUnidad: 'kg' },
    'ml-ml': { factor: 1, ingredienteUnidad: 'ml' },
    'l-l': { factor: 1, ingredienteUnidad: 'l' },
    'unidad-unidad': { factor: 1, ingredienteUnidad: 'unidad' },
    'pza-pza': { factor: 1, ingredienteUnidad: 'pza' }
};

// Función para convertir unidades
function convertirUnidad(cantidadReceta, unidadReceta, ingrediente) {
    const unidadIngrediente = ingrediente.unidad;
    const clave = `${unidadReceta}-${unidadIngrediente}`;
    
    console.log(`Convirtiendo: ${cantidadReceta} ${unidadReceta} a ${unidadIngrediente}`);
    console.log(`Clave de conversión: ${clave}`);
    
    // Si las unidades son iguales, no hay conversión
    if (unidadReceta === unidadIngrediente) {
        console.log('Unidades iguales, sin conversión');
        return cantidadReceta;
    }
    
    // Buscar equivalencia directa
    if (EQUIVALENCIAS[clave]) {
        const cantidadConvertida = cantidadReceta * EQUIVALENCIAS[clave].factor;
        console.log(`Conversión directa: ${cantidadReceta} × ${EQUIVALENCIAS[clave].factor} = ${cantidadConvertida}`);
        return cantidadConvertida;
    }
    
    // Conversión kg ↔ g
    if (unidadReceta === 'kg' && unidadIngrediente === 'g') {
        return cantidadReceta * 1000;
    }
    if (unidadReceta === 'g' && unidadIngrediente === 'kg') {
        return cantidadReceta / 1000;
    }
    
    // Conversión l ↔ ml
    if (unidadReceta === 'l' && unidadIngrediente === 'ml') {
        return cantidadReceta * 1000;
    }
    if (unidadReceta === 'ml' && unidadIngrediente === 'l') {
        return cantidadReceta / 1000;
    }
    
    // Conversiones especiales: cucharadas/cucharaditas a litros (pasando por ml)
    if ((unidadReceta === 'cucharada' || unidadReceta === 'cucharadita' || unidadReceta === 'taza') && unidadIngrediente === 'l') {
        // Primero convertir a ml, luego a litros
        let cantidadEnMl = 0;
        if (unidadReceta === 'taza') cantidadEnMl = cantidadReceta * 240;
        else if (unidadReceta === 'cucharada') cantidadEnMl = cantidadReceta * 15;
        else if (unidadReceta === 'cucharadita') cantidadEnMl = cantidadReceta * 5;
        
        const cantidadEnLitros = cantidadEnMl / 1000;
        console.log(`Conversión en 2 pasos: ${cantidadReceta} ${unidadReceta} → ${cantidadEnMl}ml → ${cantidadEnLitros}l`);
        return cantidadEnLitros;
    }
    
    // Conversiones especiales: cucharadas/cucharaditas a kilogramos (pasando por gramos)
    if ((unidadReceta === 'cucharada' || unidadReceta === 'cucharadita' || unidadReceta === 'taza') && unidadIngrediente === 'kg') {
        // Primero convertir a g, luego a kg
        let cantidadEnGramos = 0;
        if (unidadReceta === 'taza') cantidadEnGramos = cantidadReceta * 240;
        else if (unidadReceta === 'cucharada') cantidadEnGramos = cantidadReceta * 15;
        else if (unidadReceta === 'cucharadita') cantidadEnGramos = cantidadReceta * 5;
        
        const cantidadEnKg = cantidadEnGramos / 1000;
        console.log(`Conversión en 2 pasos: ${cantidadReceta} ${unidadReceta} → ${cantidadEnGramos}g → ${cantidadEnKg}kg`);
        return cantidadEnKg;
    }
    
    // Si no hay conversión posible, mostrar error
    console.error(`No se puede convertir ${unidadReceta} a ${unidadIngrediente}`);
    alert(`No se puede convertir ${unidadReceta} a ${unidadIngrediente}. Verifica las unidades.`);
    return null;
}

// Cargar datos desde la API
async function cargarDatos() {
    console.log('=== CARGANDO DATOS ===');
    console.log('API_URL:', API_URL);
    console.log('Usuario ID:', usuarioId);
    console.log('Usuario Nombre:', usuarioNombre);
    try {
        // Cargar ingredientes del usuario
        console.log('Fetching ingredientes...');
        const resIngredientes = await fetch(`${API_URL}/ingredientes?usuarioId=${usuarioId}`);
        console.log('Response ingredientes status:', resIngredientes.status);
        
        if (resIngredientes.ok) {
            const data = await resIngredientes.json();
            console.log('Ingredientes recibidos:', data.length);
            console.log('Primeros ingredientes:', data.slice(0, 3));
            ingredientes = data.map(ing => ({
                ...ing,
                id: ing._id
            }));
            console.log('Ingredientes procesados:', ingredientes.length);
        } else {
            console.error('Error al cargar ingredientes:', resIngredientes.status);
            const errorText = await resIngredientes.text();
            console.error('Error response:', errorText);
        }
        
        // Cargar recetas del usuario
        console.log('Fetching recetas...');
        const resRecetas = await fetch(`${API_URL}/recetas?usuarioId=${usuarioId}`);
        console.log('Response recetas status:', resRecetas.status);
        
        if (resRecetas.ok) {
            const data = await resRecetas.json();
            console.log('Recetas recibidas:', data.length);
            console.log('Primeras recetas:', data.slice(0, 3));
            recetas = data.map(rec => ({
                ...rec,
                id: rec._id
            }));
            console.log('Recetas procesadas:', recetas.length);
        } else {
            console.error('Error al cargar recetas:', resRecetas.status);
            const errorText = await resRecetas.text();
            console.error('Error response:', errorText);
        }
        
        console.log('Renderizando ingredientes y recetas...');
        renderizarIngredientes();
        renderizarRecetas();
        console.log('=== CARGA COMPLETADA ===');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al conectar con el servidor. Por favor, espera 30-60 segundos e intenta de nuevo. El servidor gratuito puede tardar en despertar.');
    }
}

// Guardar ingrediente en la API
async function guardarIngrediente(ingrediente) {
    try {
        const method = ingrediente._id ? 'PUT' : 'POST';
        const url = ingrediente._id 
            ? `${API_URL}/ingredientes/${ingrediente._id}`
            : `${API_URL}/ingredientes`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ingrediente)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar ingrediente');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al guardar ingrediente:', error);
        throw error;
    }
}

// Eliminar ingrediente de la API
async function eliminarIngredienteAPI(id) {
    try {
        const response = await fetch(`${API_URL}/ingredientes/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar ingrediente');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar ingrediente:', error);
        throw error;
    }
}

// Guardar receta en la API
async function guardarReceta(receta) {
    console.log('=== guardarReceta (función API) ===');
    try {
        const method = receta._id ? 'PUT' : 'POST';
        const url = receta._id 
            ? `${API_URL}/recetas/${receta._id}`
            : `${API_URL}/recetas`;
        
        console.log('Método:', method);
        console.log('URL:', url);
        console.log('Payload:', JSON.stringify(receta, null, 2));
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receta)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error response:', errorData);
            throw new Error('Error al guardar receta: ' + errorData);
        }
        
        const resultado = await response.json();
        console.log('Receta guardada, respuesta:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error en guardarReceta:', error);
        throw error;
    }
}

// Eliminar receta de la API
async function eliminarRecetaAPI(id) {
    try {
        const response = await fetch(`${API_URL}/recetas/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar receta');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar receta:', error);
        throw error;
    }
}

// ============================================
// NAVEGACIÓN ENTRE TABS
// ============================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        // Si es la pestaña de análisis, actualizar contenido
        if (tabId === 'analisis') {
            mostrarAnalisis();
        }
    });
});

// ============================================
// GESTIÓN DE INGREDIENTES
// ============================================

const modalIngrediente = document.getElementById('modalIngrediente');
const btnNuevoIngrediente = document.getElementById('btnNuevoIngrediente');
const btnCancelarIngrediente = document.getElementById('btnCancelarIngrediente');
const formIngrediente = document.getElementById('formIngrediente');
const closeIngrediente = modalIngrediente.querySelector('.close');

// Abrir modal para nuevo ingrediente
btnNuevoIngrediente.addEventListener('click', () => {
    ingredienteEditando = null;
    formIngrediente.reset();
    document.getElementById('tituloModalIngrediente').textContent = 'Nuevo Ingrediente';
    modalIngrediente.style.display = 'block';
});

// Cerrar modal
closeIngrediente.addEventListener('click', () => {
    modalIngrediente.style.display = 'none';
});

btnCancelarIngrediente.addEventListener('click', () => {
    modalIngrediente.style.display = 'none';
});

// Calcular costo por unidad en tiempo real
document.getElementById('cantidadIngrediente').addEventListener('input', calcularCostoPorUnidad);
document.getElementById('costoIngrediente').addEventListener('input', calcularCostoPorUnidad);

function calcularCostoPorUnidad() {
    const cantidad = parseFloat(document.getElementById('cantidadIngrediente').value) || 0;
    const costo = parseFloat(document.getElementById('costoIngrediente').value) || 0;
    const costoPorUnidad = cantidad > 0 ? (costo / cantidad) : 0;
    document.getElementById('costoPorUnidad').value = `$${costoPorUnidad.toFixed(2)}`;
}

// Guardar ingrediente
formIngrediente.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreIngrediente').value;
    const cantidad = parseFloat(document.getElementById('cantidadIngrediente').value);
    const unidad = document.getElementById('unidadIngrediente').value;
    const costoTotal = parseFloat(document.getElementById('costoIngrediente').value);
    const costoPorUnidad = costoTotal / cantidad;
    
    const ingrediente = {
        usuarioId,
        nombre,
        cantidad,
        unidad,
        costoTotal,
        costoPorUnidad
    };
    
    if (ingredienteEditando) {
        ingrediente._id = ingredienteEditando._id || ingredienteEditando.id;
    }
    
    try {
        await guardarIngrediente(ingrediente);
        await cargarDatos();
        modalIngrediente.style.display = 'none';
        formIngrediente.reset();
        ingredienteEditando = null;
    } catch (error) {
        alert('Error al guardar el ingrediente. Verifica la conexión con el servidor.');
    }
});

// Renderizar tabla de ingredientes
function renderizarIngredientes() {
    const tbody = document.getElementById('bodyIngredientes');
    
    if (ingredientes.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No hay ingredientes registrados. ¡Agrega tu primer ingrediente!</td></tr>';
        return;
    }
    
    tbody.innerHTML = ingredientes.map(ing => `
        <tr>
            <td>${ing.nombre}</td>
            <td>${ing.cantidad}</td>
            <td>${ing.unidad}</td>
            <td>$${ing.costoTotal.toFixed(2)}</td>
            <td>$${ing.costoPorUnidad.toFixed(2)}</td>
            <td class="acciones">
                <button class="btn-icon" onclick="editarIngrediente('${ing.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onclick="eliminarIngrediente('${ing.id}')" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Editar ingrediente
function editarIngrediente(id) {
    ingredienteEditando = ingredientes.find(i => i.id === id || i._id === id);
    if (!ingredienteEditando) return;
    
    document.getElementById('tituloModalIngrediente').textContent = 'Editar Ingrediente';
    document.getElementById('nombreIngrediente').value = ingredienteEditando.nombre;
    document.getElementById('cantidadIngrediente').value = ingredienteEditando.cantidad;
    document.getElementById('unidadIngrediente').value = ingredienteEditando.unidad;
    document.getElementById('costoIngrediente').value = ingredienteEditando.costoTotal;
    calcularCostoPorUnidad();
    
    modalIngrediente.style.display = 'block';
}

// Eliminar ingrediente
async function eliminarIngrediente(id) {
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
        try {
            await eliminarIngredienteAPI(id);
            await cargarDatos();
            actualizarSelectIngredientes();
        } catch (error) {
            alert('Error al eliminar el ingrediente. Verifica la conexión con el servidor.');
        }
    }
}

// ============================================
// GESTIÓN DE RECETAS
// ============================================

const modalReceta = document.getElementById('modalReceta');
const btnNuevaReceta = document.getElementById('btnNuevaReceta');
const btnCancelarReceta = document.getElementById('btnCancelarReceta');
const formReceta = document.getElementById('formReceta');
const closeReceta = document.getElementById('closeReceta');

// Abrir modal para nueva receta
btnNuevaReceta.addEventListener('click', () => {
    console.log('=== ABRIR MODAL NUEVA RECETA ===');
    console.log('Ingredientes disponibles:', ingredientes.length);
    
    if (ingredientes.length === 0) {
        console.log('ERROR: No hay ingredientes disponibles');
        alert('Primero debes agregar ingredientes antes de crear una receta.');
        return;
    }
    
    console.log('Inicializando modal...');
    recetaEditando = null;
    ingredientesRecetaTemp = [];
    formReceta.reset();
    document.getElementById('tituloModalReceta').textContent = 'Nueva Receta';
    
    console.log('Actualizando select de ingredientes...');
    actualizarSelectIngredientes();
    
    console.log('Actualizando lista de ingredientes (vacía)...');
    actualizarListaIngredientesReceta();
    
    console.log('Mostrando modal...');
    modalReceta.style.display = 'block';
    console.log('Modal abierto correctamente');
});

// Cerrar modal
closeReceta.addEventListener('click', () => {
    console.log('=== CERRAR MODAL (X) ===');
    modalReceta.style.display = 'none';
    console.log('Modal cerrado');
});

btnCancelarReceta.addEventListener('click', () => {
    console.log('=== CERRAR MODAL (Cancelar) ===');
    modalReceta.style.display = 'none';
    console.log('Modal cerrado');
});

// Actualizar select de ingredientes
function actualizarSelectIngredientes() {
    console.log('=== actualizarSelectIngredientes ===');
    const select = document.getElementById('selectIngredienteReceta');
    console.log('Select element:', select ? 'encontrado' : 'NO ENCONTRADO');
    console.log('Ingredientes a mostrar:', ingredientes.length);
    
    select.innerHTML = '<option value="">Seleccionar ingrediente...</option>' +
        ingredientes.map(ing => `<option value="${ing.id}">${ing.nombre} (${ing.unidad})</option>`).join('');
    
    console.log('Select actualizado con', ingredientes.length, 'opciones');
}

// Agregar ingrediente a la receta
document.getElementById('btnAgregarIngredienteReceta').addEventListener('click', () => {
    console.log('=== AGREGAR INGREDIENTE A RECETA ===');
    const selectIngrediente = document.getElementById('selectIngredienteReceta');
    const inputCantidad = document.getElementById('cantidadIngredienteReceta');
    const selectUnidad = document.getElementById('unidadIngredienteReceta');
    const cantidad = parseFloat(inputCantidad.value);
    const unidadReceta = selectUnidad.value;
    
    console.log('Select element:', selectIngrediente ? 'encontrado' : 'NO ENCONTRADO');
    console.log('Input cantidad element:', inputCantidad ? 'encontrado' : 'NO ENCONTRADO');
    console.log('Select value:', selectIngrediente.value);
    console.log('Cantidad ingresada:', cantidad);
    console.log('Unidad seleccionada:', unidadReceta);
    console.log('Ingredientes disponibles:', ingredientes.length);
    console.log('Ingredientes en receta actual:', ingredientesRecetaTemp.length);
    
    if (!selectIngrediente.value || !cantidad || cantidad <= 0) {
        console.log('Validación falló - datos incompletos o inválidos');
        alert('Por favor selecciona un ingrediente y una cantidad válida.');
        return;
    }
    
    const ingredienteId = selectIngrediente.value;
    console.log('ID del ingrediente seleccionado:', ingredienteId);
    console.log('Buscando ingrediente en array...');
    const ingrediente = ingredientes.find(i => i.id === ingredienteId);
    
    console.log('Resultado búsqueda:', ingrediente ? `encontrado: ${ingrediente.nombre}` : 'NO ENCONTRADO');
    
    if (!ingrediente) {
        console.error('ERROR: Ingrediente no encontrado con ID:', ingredienteId);
        console.error('IDs disponibles:', ingredientes.map(i => i.id));
        alert('Ingrediente no encontrado.');
        return;
    }
    
    // Verificar si ya existe
    console.log('Verificando si el ingrediente ya está en la receta...');
    const existente = ingredientesRecetaTemp.find(i => i.ingredienteId === ingredienteId);
    if (existente) {
        console.log('El ingrediente ya existe en la receta');
        alert('Este ingrediente ya está en la receta. Elimínalo primero si quieres cambiar la cantidad.');
        return;
    }
    
    // Convertir unidades
    console.log('Convirtiendo unidades...');
    const cantidadConvertida = convertirUnidad(cantidad, unidadReceta, ingrediente);
    
    if (cantidadConvertida === null) {
        return; // Error en conversión
    }
    
    console.log('Agregando ingrediente a la lista temporal...');
    const nuevoIngrediente = {
        ingredienteId: ingrediente.id,
        nombre: ingrediente.nombre,
        cantidadUsada: cantidadConvertida, // Cantidad convertida a la unidad del inventario
        cantidadReceta: cantidad,           // Cantidad original de la receta
        unidadReceta: unidadReceta,         // Unidad usada en la receta
        unidad: ingrediente.unidad,         // Unidad del inventario
        costoPorUnidad: ingrediente.costoPorUnidad,
        costoTotal: cantidadConvertida * ingrediente.costoPorUnidad
    };
    
    console.log('Nuevo ingrediente creado:', nuevoIngrediente);
    ingredientesRecetaTemp.push(nuevoIngrediente);
    console.log('Ingrediente agregado. Total en receta:', ingredientesRecetaTemp.length);
    console.log('Ingredientes en receta temp:', ingredientesRecetaTemp);
    
    console.log('Limpiando campos del formulario...');
    document.getElementById('cantidadIngredienteReceta').value = '';
    selectIngrediente.value = '';
    
    console.log('Actualizando vista de lista...');
    actualizarListaIngredientesReceta();
    
    console.log('Recalculando costos...');
    calcularCostoTotalReceta();
    console.log('Ingrediente agregado exitosamente');
});

// Actualizar lista de ingredientes en la receta
function actualizarListaIngredientesReceta() {
    console.log('=== actualizarListaIngredientesReceta ===');
    const lista = document.getElementById('ingredientesListaReceta');
    console.log('Elemento lista encontrado:', !!lista);
    console.log('Ingredientes temp:', ingredientesRecetaTemp.length);
    
    if (ingredientesRecetaTemp.length === 0) {
        console.log('Lista vacía, mostrando mensaje');
        lista.innerHTML = '<p class="empty-message">No hay ingredientes agregados a la receta.</p>';
        return;
    }
    
    console.log('Renderizando', ingredientesRecetaTemp.length, 'ingredientes');
    lista.innerHTML = ingredientesRecetaTemp.map((ing, index) => {
        // Mostrar la cantidad de la receta si existe, sino la cantidad usada
        const cantidadMostrar = ing.cantidadReceta || ing.cantidadUsada;
        const unidadMostrar = ing.unidadReceta || ing.unidad;
        return `
            <div class="ingrediente-item">
                <span>${ing.nombre}: ${cantidadMostrar} ${unidadMostrar}</span>
                <span>$${ing.costoTotal.toFixed(2)}</span>
                <button type="button" class="btn-icon-small" onclick="eliminarIngredienteReceta(${index})">❌</button>
            </div>
        `;
    }).join('');
    console.log('Lista actualizada con HTML');
}

// Eliminar ingrediente de la receta
function eliminarIngredienteReceta(index) {
    console.log('=== ELIMINAR INGREDIENTE DE RECETA ===');
    console.log('Índice a eliminar:', index);
    console.log('Total ingredientes antes:', ingredientesRecetaTemp.length);
    console.log('Ingrediente a eliminar:', ingredientesRecetaTemp[index]);
    
    ingredientesRecetaTemp.splice(index, 1);
    
    console.log('Total ingredientes después:', ingredientesRecetaTemp.length);
    console.log('Actualizando lista...');
    actualizarListaIngredientesReceta();
    
    console.log('Recalculando costos...');
    calcularCostoTotalReceta();
    console.log('Ingrediente eliminado exitosamente');
}

// Calcular costo total de la receta
document.getElementById('costoEmpaquetado').addEventListener('input', calcularCostoTotalReceta);
document.getElementById('porcionesReceta').addEventListener('input', calcularCostoTotalReceta);

function calcularCostoTotalReceta() {
    console.log('=== calcularCostoTotalReceta ===');
    const costoIngredientes = ingredientesRecetaTemp.reduce((sum, ing) => sum + ing.costoTotal, 0);
    const costoEmpaquetado = parseFloat(document.getElementById('costoEmpaquetado').value) || 0;
    const porciones = parseFloat(document.getElementById('porcionesReceta').value) || 1;
    
    const costoTotal = costoIngredientes + costoEmpaquetado;
    const costoPorPorcion = costoTotal / porciones;
    
    console.log('Costo ingredientes:', costoIngredientes);
    console.log('Costo empaquetado:', costoEmpaquetado);
    console.log('Porciones:', porciones);
    console.log('Costo total:', costoTotal);
    console.log('Costo por porción:', costoPorPorcion);
    
    document.getElementById('costoTotalReceta').textContent = costoTotal.toFixed(2);
    document.getElementById('costoPorPorcion').textContent = costoPorPorcion.toFixed(2);
}

// Guardar receta
formReceta.addEventListener('submit', async (e) => {
    console.log('=== SUBMIT RECETA ===');
    e.preventDefault();
    
    if (ingredientesRecetaTemp.length === 0) {
        console.log('Error: no hay ingredientes');
        alert('Debes agregar al menos un ingrediente a la receta.');
        return;
    }
    
    const nombre = document.getElementById('nombreReceta').value;
    const descripcion = document.getElementById('descripcionReceta').value;
    const porciones = parseFloat(document.getElementById('porcionesReceta').value);
    const costoEmpaquetado = parseFloat(document.getElementById('costoEmpaquetado').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    
    console.log('Datos del formulario:');
    console.log('- Usuario ID:', usuarioId);
    console.log('- Nombre:', nombre);
    console.log('- Descripción:', descripcion);
    console.log('- Porciones:', porciones);
    console.log('- Costo empaquetado:', costoEmpaquetado);
    console.log('- Precio de venta:', precioVenta);
    console.log('- Ingredientes temp:', ingredientesRecetaTemp);
    
    // Enviar solo los campos requeridos por el backend
    // El backend calculará automáticamente los costos
    const receta = {
        usuarioId: usuarioId,
        nombre,
        descripcion,
        porciones,
        ingredientes: ingredientesRecetaTemp.map(ing => ({
            ingredienteId: ing.ingredienteId,
            cantidadUsada: ing.cantidadUsada,
            cantidadReceta: ing.cantidadReceta || ing.cantidadUsada,
            unidadReceta: ing.unidadReceta || ing.unidad
        })),
        costoEmpaquetado,
        precioVenta
    };
    
    console.log('Objeto receta a enviar:', JSON.stringify(receta, null, 2));
    
    if (recetaEditando) {
        receta._id = recetaEditando._id || recetaEditando.id;
        console.log('Editando receta con ID:', receta._id);
    } else {
        console.log('Creando nueva receta');
    }
    
    try {
        console.log('Llamando a guardarReceta...');
        const resultado = await guardarReceta(receta);
        console.log('Receta guardada exitosamente:', resultado);
        
        console.log('Recargando datos...');
        await cargarDatos();
        console.log('Datos recargados');
        
        console.log('Cerrando modal y limpiando formulario');
        modalReceta.style.display = 'none';
        formReceta.reset();
        ingredientesRecetaTemp = [];
        recetaEditando = null;
        console.log('Proceso completado exitosamente');
    } catch (error) {
        console.error('Error completo al guardar receta:', error);
        console.error('Error message:', error.message);
        alert('Error al guardar la receta:\n' + error.message + '\n\nRevisa la consola del navegador (F12) para más detalles.');
    }
});

// Renderizar recetas
function renderizarRecetas() {
    console.log('=== renderizarRecetas ===');
    console.log('Total recetas:', recetas.length);
    const grid = document.getElementById('recetasGrid');
    
    if (recetas.length === 0) {
        console.log('No hay recetas, mostrando mensaje vacío');
        grid.innerHTML = '<div class="empty-state-card"><p>No hay recetas registradas. ¡Crea tu primera receta!</p></div>';
        return;
    }
    
    grid.innerHTML = recetas.map(receta => `
        <div class="receta-card">
            <div class="receta-header">
                <h3>${receta.nombre}</h3>
                <div class="receta-acciones">
                    <button class="btn-icon" onclick="editarReceta('${receta.id}')" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="eliminarReceta('${receta.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
            ${receta.descripcion ? `<p class="receta-descripcion">${receta.descripcion}</p>` : ''}
            <div class="receta-info">
                <span>🍽️ ${receta.porciones} porcion${receta.porciones > 1 ? 'es' : ''}</span>
                <span>💰 Costo total: $${receta.costoTotal.toFixed(2)}</span>
            </div>
            <div class="receta-costo-porcion">
                <strong>Costo por porción: $${receta.costoPorPorcion.toFixed(2)}</strong>
            </div>
            <details class="receta-detalles">
                <summary>Ver ingredientes (${receta.ingredientes.length})</summary>
                <ul>
                    ${receta.ingredientes.map(ing => `
                        <li>${ing.nombre}: ${ing.cantidadReceta || ing.cantidadUsada} ${ing.unidadReceta || ing.unidad} - $${(ing.costoPorUnidad * ing.cantidadUsada).toFixed(2)}</li>
                    `).join('')}
                    ${receta.costoEmpaquetado > 0 ? `<li>Empaquetado: $${receta.costoEmpaquetado.toFixed(2)}</li>` : ''}
                </ul>
            </details>
        </div>
    `).join('');
}

// Editar receta
function editarReceta(id) {
    console.log('=== EDITANDO RECETA ===');
    console.log('ID recibido:', id, 'tipo:', typeof id);
    recetaEditando = recetas.find(r => r.id === id);
    console.log('Receta encontrada:', recetaEditando ? 'SÍ' : 'NO');
    if (!recetaEditando) {
        console.error('No se encontró la receta con ID:', id);
        console.error('IDs disponibles:', recetas.map(r => r.id));
        return;
    }
    
    console.log('Receta completa:', recetaEditando);
    
    document.getElementById('tituloModalReceta').textContent = 'Editar Receta';
    document.getElementById('nombreReceta').value = recetaEditando.nombre;
    document.getElementById('descripcionReceta').value = recetaEditando.descripcion || '';
    document.getElementById('porcionesReceta').value = recetaEditando.porciones;
    document.getElementById('costoEmpaquetado').value = recetaEditando.costoEmpaquetado || 0;
    document.getElementById('precioVenta').value = recetaEditando.precioVenta || 0;
    
    // Transformar ingredientes del backend al formato del frontend
    console.log('Transformando ingredientes del backend al formato correcto...');
    ingredientesRecetaTemp = recetaEditando.ingredientes.map(ing => {
        console.log('Ingrediente del backend:', ing);
        return {
            ingredienteId: ing.ingredienteId,
            nombre: ing.nombre,
            cantidadUsada: ing.cantidadUsada,
            cantidadReceta: ing.cantidadReceta || ing.cantidadUsada, // Mantener cantidad original de receta
            unidadReceta: ing.unidadReceta || ing.unidad,            // Mantener unidad original de receta
            unidad: ing.unidad,
            costoPorUnidad: ing.costoPorUnidad,
            costoTotal: ing.cantidadUsada * ing.costoPorUnidad
        };
    });
    console.log('Ingredientes transformados:', ingredientesRecetaTemp);
    
    actualizarSelectIngredientes();
    actualizarListaIngredientesReceta();
    calcularCostoTotalReceta();
    
    modalReceta.style.display = 'block';
}

// Eliminar receta
async function eliminarReceta(id) {
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
        try {
            await eliminarRecetaAPI(id);
            await cargarDatos();
        } catch (error) {
            alert('Error al eliminar la receta. Verifica la conexión con el servidor.');
        }
    }
}

// ============================================
// ANÁLISIS DE COSTOS Y GANANCIAS
// ============================================

function mostrarAnalisis() {
    const container = document.getElementById('analisisRecetas');
    
    if (recetas.length === 0) {
        container.innerHTML = '<div class="empty-state-card"><p>No hay recetas para analizar. Crea recetas primero.</p></div>';
        return;
    }
    
    container.innerHTML = recetas.map(receta => {
        const precioVentaActual = receta.precioVenta || 0;
        const precioVentaSugerido = receta.costoPorPorcion * 3; // Margen del 200%
        const precioParaMostrar = precioVentaActual > 0 ? precioVentaActual : precioVentaSugerido;
        const ganancia = precioParaMostrar - receta.costoPorPorcion;
        const margenPorcentaje = precioParaMostrar > 0 ? ((ganancia / precioParaMostrar) * 100).toFixed(1) : 0;
        
        return `
            <div class="analisis-card">
                <h3>${receta.nombre}</h3>
                <div class="analisis-grid">
                    <div class="analisis-item">
                        <label>Costo por porción:</label>
                        <span class="valor-costo">$${receta.costoPorPorcion.toFixed(2)}</span>
                    </div>
                    <div class="analisis-item">
                        <label>${precioVentaActual > 0 ? 'Precio de venta configurado' : 'Precio sugerido de venta'}:</label>
                        <span class="valor-sugerido">$${precioParaMostrar.toFixed(2)}</span>
                        ${precioVentaActual === 0 ? '<small>(Margen 200%)</small>' : ''}
                    </div>
                    <div class="analisis-item">
                        <label>Ganancia por porción:</label>
                        <span class="valor-ganancia ${ganancia < 0 ? 'negativa' : ''}">$${ganancia.toFixed(2)}</span>
                        <small>(${margenPorcentaje}% margen)</small>
                    </div>
                </div>
                
                <div class="calculadora-personalizada">
                    <h4>Calculadora de Ganancias</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Precio de venta personalizado ($):</label>
                            <input type="number" step="0.01" 
                                   class="input-precio-venta" 
                                   data-receta-id="${receta.id}"
                                   data-costo="${receta.costoPorPorcion}"
                                   placeholder="${precioParaMostrar.toFixed(2)}"
                                   value="${precioVentaActual > 0 ? precioVentaActual.toFixed(2) : ''}">
                        </div>
                        <div class="form-group">
                            <label>Porciones a vender:</label>
                            <input type="number" 
                                   class="input-porciones-vender" 
                                   data-receta-id="${receta.id}"
                                   data-costo="${receta.costoPorPorcion}"
                                   value="1" min="1">
                        </div>
                    </div>
                    <div class="resultados-personalizados" id="resultados-${receta.id}">
                        <div class="resultado-item">
                            <span>Inversión total:</span>
                            <strong>$${receta.costoPorPorcion.toFixed(2)}</strong>
                        </div>
                        <div class="resultado-item">
                            <span>Ingreso total:</span>
                            <strong>$${precioVentaSugerido.toFixed(2)}</strong>
                        </div>
                        <div class="resultado-item ganancia-final">
                            <span>Ganancia total:</span>
                            <strong>$${ganancia.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="desglose-costos">
                    <h4>Desglose de Costos</h4>
                    <table class="tabla-desglose">
                        <tr>
                            <td>Costo de ingredientes:</td>
                            <td>$${receta.costoIngredientes.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Costo de empaquetado:</td>
                            <td>$${receta.costoEmpaquetado.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Costo total (${receta.porciones} porcion${receta.porciones > 1 ? 'es' : ''}):</strong></td>
                            <td><strong>$${receta.costoTotal.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners para calculadora personalizada
    document.querySelectorAll('.input-precio-venta, .input-porciones-vender').forEach(input => {
        input.addEventListener('input', function() {
            const recetaId = parseInt(this.dataset.recetaId);
            calcularGananciasPersonalizadas(recetaId);
        });
        input.addEventListener('change', function() {
            const recetaId = parseInt(this.dataset.recetaId);
            calcularGananciasPersonalizadas(recetaId);
        });
    });
    
    // Calcular ganancias iniciales para todas las recetas
    recetas.forEach(receta => {
        calcularGananciasPersonalizadas(receta.id);
    });
}

function calcularGananciasPersonalizadas(recetaId) {
    const receta = recetas.find(r => r.id === recetaId);
    if (!receta) return;
    
    const precioVentaInput = document.querySelector(`.input-precio-venta[data-receta-id="${recetaId}"]`);
    const porcionesInput = document.querySelector(`.input-porciones-vender[data-receta-id="${recetaId}"]`);
    
    const precioVenta = parseFloat(precioVentaInput.value) || (receta.costoPorPorcion * 3);
    const porciones = parseInt(porcionesInput.value) || 1;
    
    const inversionTotal = receta.costoPorPorcion * porciones;
    const ingresoTotal = precioVenta * porciones;
    const gananciaTotal = ingresoTotal - inversionTotal;
    
    const resultadosDiv = document.getElementById(`resultados-${recetaId}`);
    resultadosDiv.innerHTML = `
        <div class="resultado-item">
            <span>Inversión total:</span>
            <strong>$${inversionTotal.toFixed(2)}</strong>
        </div>
        <div class="resultado-item">
            <span>Ingreso total:</span>
            <strong>$${ingresoTotal.toFixed(2)}</strong>
        </div>
        <div class="resultado-item ganancia-final ${gananciaTotal < 0 ? 'perdida' : ''}">
            <span>${gananciaTotal < 0 ? 'Pérdida' : 'Ganancia'} total:</span>
            <strong>$${gananciaTotal.toFixed(2)}</strong>
        </div>
    `;
}

// ============================================
// CERRAR MODALES AL HACER CLICK FUERA
// ============================================

window.addEventListener('click', (e) => {
    if (e.target === modalIngrediente) {
        modalIngrediente.style.display = 'none';
    }
    if (e.target === modalReceta) {
        modalReceta.style.display = 'none';
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================

cargarDatos();
renderizarIngredientes();
renderizarRecetas();
