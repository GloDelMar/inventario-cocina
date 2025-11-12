// ============================================
// SCRIPT DE MIGRACIÓN: localStorage → MongoDB
// ============================================

// Este script te ayuda a migrar tus datos desde localStorage a MongoDB

console.log('📦 Script de Migración - localStorage a MongoDB');
console.log('================================================\n');

// Verificar si hay datos en localStorage
const ingredientesLocal = localStorage.getItem('ingredientes');
const recetasLocal = localStorage.getItem('recetas');

if (!ingredientesLocal && !recetasLocal) {
    console.log('❌ No hay datos en localStorage para migrar.');
    console.log('Si ya usaste la app anteriormente, tus datos deberían estar aquí.');
} else {
    console.log('✅ Datos encontrados en localStorage:');
    if (ingredientesLocal) {
        const ingredientes = JSON.parse(ingredientesLocal);
        console.log(`   - ${ingredientes.length} ingredientes`);
    }
    if (recetasLocal) {
        const recetas = JSON.parse(recetasLocal);
        console.log(`   - ${recetas.length} recetas`);
    }
    
    console.log('\n📝 Pasos para migrar:');
    console.log('1. Copia el siguiente código en la consola del navegador (F12)');
    console.log('2. Presiona Enter para ejecutarlo\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`
// CÓDIGO DE MIGRACIÓN - Copia desde aquí
(async function migrar() {
    const API_URL = 'http://localhost:8080/api';
    
    // Obtener datos de localStorage
    const ingredientesStr = localStorage.getItem('ingredientes');
    const recetasStr = localStorage.getItem('recetas');
    
    if (!ingredientesStr && !recetasStr) {
        console.log('❌ No hay datos para migrar');
        return;
    }
    
    const ingredientes = ingredientesStr ? JSON.parse(ingredientesStr) : [];
    const recetas = recetasStr ? JSON.parse(recetasStr) : [];
    
    console.log('🚀 Iniciando migración...');
    console.log(\`📦 Ingredientes: \${ingredientes.length}\`);
    console.log(\`📦 Recetas: \${recetas.length}\`);
    console.log('');
    
    // Migrar ingredientes
    let ingMigrados = 0;
    for (const ing of ingredientes) {
        try {
            const response = await fetch(\`\${API_URL}/ingredientes\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: ing.nombre,
                    cantidad: ing.cantidad,
                    unidad: ing.unidad,
                    costoTotal: ing.costoTotal,
                    costoPorUnidad: ing.costoPorUnidad
                })
            });
            
            if (response.ok) {
                ingMigrados++;
                console.log(\`✅ Ingrediente migrado: \${ing.nombre}\`);
            } else {
                console.log(\`❌ Error al migrar: \${ing.nombre}\`);
            }
        } catch (error) {
            console.error(\`❌ Error: \${error.message}\`);
        }
    }
    
    // Migrar recetas
    let recMigradas = 0;
    for (const rec of recetas) {
        try {
            const response = await fetch(\`\${API_URL}/recetas\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec)
            });
            
            if (response.ok) {
                recMigradas++;
                console.log(\`✅ Receta migrada: \${rec.nombre}\`);
            } else {
                console.log(\`❌ Error al migrar: \${rec.nombre}\`);
            }
        } catch (error) {
            console.error(\`❌ Error: \${error.message}\`);
        }
    }
    
    console.log('');
    console.log('════════════════════════════════════');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('════════════════════════════════════');
    console.log(\`✅ Ingredientes migrados: \${ingMigrados}/\${ingredientes.length}\`);
    console.log(\`✅ Recetas migradas: \${recMigradas}/\${recetas.length}\`);
    console.log('');
    
    if (ingMigrados === ingredientes.length && recMigradas === recetas.length) {
        console.log('🎉 ¡Migración completada exitosamente!');
        console.log('');
        console.log('Ahora puedes:');
        console.log('1. Recargar la página (F5)');
        console.log('2. Verificar que tus datos están en MongoDB');
        console.log('3. Opcional: Limpiar localStorage con:');
        console.log('   localStorage.clear()');
    } else {
        console.log('⚠️  Hubo algunos errores en la migración.');
        console.log('Verifica que el backend esté corriendo en http://localhost:8080');
    }
})();
// FIN DEL CÓDIGO - Copia hasta aquí
    `);
    console.log('═══════════════════════════════════════════════════════════\n');
}

console.log('\n💡 INSTRUCCIONES:');
console.log('═══════════════════════════════════════════════════════════');
console.log('1. Abre la aplicación en tu navegador: http://localhost:3000');
console.log('2. Presiona F12 para abrir las DevTools');
console.log('3. Ve a la pestaña "Console"');
console.log('4. Copia y pega el código de migración que se muestra arriba');
console.log('5. Presiona Enter para ejecutar');
console.log('6. Espera a que complete la migración');
console.log('7. Recarga la página para ver tus datos desde MongoDB');
console.log('═══════════════════════════════════════════════════════════\n');
