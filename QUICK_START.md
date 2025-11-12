# 🚀 Guía Rápida de Inicio

## ✅ Estado Actual

- ✅ **Backend**: Corriendo en http://localhost:8080
- ✅ **Frontend**: Corriendo en http://localhost:3000
- ⚠️  **MongoDB**: No instalado (necesario para persistencia)

## 🎯 Próximos Pasos

### 1. Instalar MongoDB (Requerido)

**Para usar la app con base de datos, necesitas instalar MongoDB:**

#### Ubuntu/Debian:
```bash
# Importar clave
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Agregar repositorio
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar
sudo systemctl status mongod
```

#### Alternativa: Usar MongoDB Atlas (Cloud - Gratis)
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta y un cluster gratuito
3. Obtén tu connection string
4. Actualiza `MONGODB_URI` en `backend/.env`

### 2. Reiniciar el Backend

Después de instalar MongoDB:

```bash
# Detener el backend actual (Ctrl+C en la terminal del backend)

# Reiniciar
cd /home/glo_suarez/inventario/backend
npm start
```

### 3. Usar la Aplicación

Abre http://localhost:3000 en tu navegador

## 📝 Comandos Útiles

### Iniciar Todo de Una Vez
```bash
cd /home/glo_suarez/inventario
./start.sh
```

### Iniciar Solo Backend
```bash
cd backend
npm start
```

### Iniciar Solo Frontend
```bash
cd /home/glo_suarez/inventario
python3 -m http.server 3000
```

### Verificar Estado de la API
```bash
curl http://localhost:8080/api/health
```

### Ver Logs de MongoDB
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### Conectar a MongoDB (Shell)
```bash
mongosh
use inventario-cocina
db.ingredientes.find()
db.recetas.find()
```

## 🔧 Solución de Problemas

### Error: MongoDB connection failed

**Causa**: MongoDB no está instalado o no está corriendo

**Solución**:
```bash
# Verificar si está instalado
mongod --version

# Verificar si está corriendo
sudo systemctl status mongod

# Iniciar si no está corriendo
sudo systemctl start mongod
```

### Error: Puerto 8080 en uso

**Solución**:
```bash
# Ver qué proceso usa el puerto
lsof -i :8080

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en backend/.env
PORT=8081
```

### Error: Puerto 3000 en uso

**Solución**:
```bash
# Ver qué proceso usa el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O usar otro puerto
python3 -m http.server 3001
# Y actualiza API_URL en app.js si es necesario
```

### El frontend no se conecta al backend

**Verificar**:
1. Que el backend esté corriendo: http://localhost:8080/api/health
2. Que `API_URL` en `app.js` sea `http://localhost:8080/api`
3. Que no haya errores de CORS en la consola del navegador (F12)

## 📦 Estructura de Puertos

- **Frontend**: Puerto 3000 (servidor estático)
- **Backend API**: Puerto 8080 (Express + Node.js)
- **MongoDB**: Puerto 27017 (base de datos)

## 🎉 ¡Listo!

Una vez que MongoDB esté instalado y corriendo:

1. Abre http://localhost:3000
2. Agrega ingredientes
3. Crea recetas
4. Analiza costos
5. ¡Todos los datos se guardarán en MongoDB!

## 📚 Más Información

- Ver `README.md` para documentación completa
- Ver `backend/routes/` para ejemplos de API
- Ver `backend/models/` para esquemas de datos
