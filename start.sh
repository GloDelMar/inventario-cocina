#!/bin/bash

echo "🍳 Iniciando aplicación de Gestión de Cocina"
echo "============================================"
echo ""

# Verificar si MongoDB está corriendo
echo "📦 Verificando MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB no está corriendo. Intentando iniciar..."
    sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log 2>/dev/null || echo "❌ No se pudo iniciar MongoDB automáticamente. Inícialo manualmente."
else
    echo "✅ MongoDB está corriendo"
fi

echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo ""
echo "🚀 Iniciando backend en puerto 8080..."
npm start &
BACKEND_PID=$!

# Esperar a que el backend inicie
sleep 3

echo ""
echo "🌐 Iniciando frontend en puerto 3000..."
cd ..
python3 -m http.server 3000 &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ Aplicación iniciada correctamente!"
echo ""
echo "📝 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   API Health: http://localhost:8080/api/health"
echo ""
echo "Para detener la aplicación presiona Ctrl+C"
echo "============================================"

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Aplicación detenida"
    exit 0
}

trap cleanup INT TERM

# Mantener el script corriendo
wait
