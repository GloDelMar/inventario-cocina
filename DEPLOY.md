# 🚀 GUÍA DE DESPLIEGUE

Este documento explica cómo desplegar la aplicación en producción usando Vercel (frontend) y Render (backend).

## 📦 Arquitectura de Despliegue

- **Frontend**: Vercel (archivos estáticos)
- **Backend**: Render (API Node.js)
- **Base de Datos**: MongoDB Atlas (ya configurado)

---

## 🌐 PASO 1: Desplegar Backend en Render

### 1.1 Crear cuenta en Render
1. Ve a [https://render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub

### 1.2 Crear Web Service
1. Click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub: `GloDelMar/inventario-cocina`
3. Configura el servicio:
   - **Name**: `inventario-cocina-backend`
   - **Region**: Oregon (o el más cercano)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Configurar Variables de Entorno
En la sección "Environment", agrega estas variables:

```
MONGODB_URI=mongodb+srv://glosuacas_db_user:gomenkudasai5.5@laboralpanaderia.c2fwkup.mongodb.net/inventario-cocina?retryWrites=true&w=majority
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
```

**IMPORTANTE**: Actualiza `FRONTEND_URL` después de desplegar el frontend.

### 1.4 Desplegar
1. Click en **"Create Web Service"**
2. Espera a que complete el despliegue (2-5 minutos)
3. **Copia la URL del backend** (será algo como: `https://inventario-cocina-backend.onrender.com`)

---

## 🎨 PASO 2: Desplegar Frontend en Vercel

### 2.1 Actualizar URL del Backend
**ANTES de desplegar**, actualiza el archivo `app.js`:

```javascript
// Cambia esta línea:
const API_URL = 'http://localhost:8080/api';

// Por esta (usa la URL de Render del paso anterior):
const API_URL = 'https://inventario-cocina-backend.onrender.com/api';
```

Guarda y haz commit:
```bash
git add app.js
git commit -m "Actualizar API_URL para producción"
git push
```

### 2.2 Desplegar en Vercel

#### Opción A: Desde la Web (Recomendado)
1. Ve a [https://vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub
3. Click en **"Add New"** → **"Project"**
4. Importa tu repositorio: `GloDelMar/inventario-cocina`
5. Configuración:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: (dejar vacío)
   - **Output Directory**: `./` (dejar vacío)
6. Click en **"Deploy"**
7. Espera a que termine (1-2 minutos)
8. **Copia la URL de producción** (será algo como: `https://inventario-cocina.vercel.app`)

#### Opción B: Desde CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde la carpeta raíz del proyecto
cd /home/glo_suarez/inventario
vercel login
vercel

# Seguir las instrucciones
```

### 2.3 Actualizar FRONTEND_URL en Render
1. Ve a tu backend en Render
2. Ve a **"Environment"**
3. Actualiza `FRONTEND_URL` con la URL de Vercel
4. Guarda los cambios (se reiniciará automáticamente)

---

## 🔄 PASO 3: Configuración Final

### 3.1 Verificar MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. **Network Access** → Asegúrate de tener `0.0.0.0/0` (permitir desde cualquier IP)
3. O agrega las IPs de Render y Vercel

### 3.2 Probar la Aplicación
1. Abre tu app en Vercel: `https://tu-app.vercel.app`
2. Intenta agregar un ingrediente
3. Verifica que se guarde en MongoDB
4. Verifica en la consola del navegador (F12) que no haya errores de CORS

### 3.3 Verificar Backend
```bash
# Desde tu computadora o terminal
curl https://inventario-cocina-backend.onrender.com/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "mongodb": "conectado",
  "timestamp": "..."
}
```

---

## 🚨 Solución de Problemas

### Error de CORS
**Síntoma**: Error en consola del navegador sobre CORS

**Solución**:
1. Verifica que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
2. Asegúrate de que el backend esté corriendo en Render
3. Revisa los logs en Render: Dashboard → Logs

### Backend no se conecta a MongoDB
**Síntoma**: Error "MongoDB connection failed"

**Solución**:
1. Verifica `MONGODB_URI` en las variables de entorno de Render
2. Verifica en MongoDB Atlas → Network Access → 0.0.0.0/0 esté permitido
3. Verifica que el usuario/contraseña sean correctos

### El frontend no carga datos
**Síntoma**: La app carga pero no muestra ingredientes/recetas

**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Busca peticiones a `/api/ingredientes` y `/api/recetas`
4. Verifica que apunten al backend de Render
5. Si apuntan a localhost, actualiza `API_URL` en `app.js`

### Render: App muy lenta o "spinning down"
**Síntoma**: La primera carga es muy lenta (30+ segundos)

**Explicación**: El plan gratuito de Render "duerme" la app después de inactividad.

**Soluciones**:
- **Opción 1**: Esperar 30-60 segundos en la primera carga
- **Opción 2**: Usar un servicio de "keep-alive" (ping cada 10 min)
- **Opción 3**: Upgrade a plan de pago (no se duerme)

---

## 📊 URLs Finales

Después del despliegue, tendrás:

- **Frontend (Vercel)**: `https://inventario-cocina.vercel.app`
- **Backend (Render)**: `https://inventario-cocina-backend.onrender.com`
- **MongoDB Atlas**: `laboralpanaderia.c2fwkup.mongodb.net`

### Health Check del Backend:
```
https://inventario-cocina-backend.onrender.com/api/health
```

### API Endpoints:
```
GET/POST    https://inventario-cocina-backend.onrender.com/api/ingredientes
GET/PUT/DEL https://inventario-cocina-backend.onrender.com/api/ingredientes/:id
GET/POST    https://inventario-cocina-backend.onrender.com/api/recetas
GET/PUT/DEL https://inventario-cocina-backend.onrender.com/api/recetas/:id
```

---

## 🔄 Actualizaciones Futuras

Cuando hagas cambios al código:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push

# Vercel se despliega automáticamente
# Render se despliega automáticamente
```

Ambos servicios tienen **despliegue automático** desde GitHub.

---

## 💡 Consejos Finales

1. **Guarda las URLs**: Anota tus URLs de producción en un lugar seguro
2. **Backup de MongoDB**: Exporta tus datos periódicamente desde MongoDB Atlas
3. **Monitoreo**: Revisa los logs de Render ocasionalmente
4. **Costos**: Ambos servicios son gratuitos, pero tienen límites:
   - Vercel: 100 GB bandwidth/mes
   - Render: 750 horas/mes (suficiente para 1 app)
   - MongoDB Atlas: 512 MB storage

5. **Dominios Personalizados** (opcional):
   - Vercel y Render permiten agregar dominios personalizados gratis
   - Necesitas comprar un dominio (ejemplo: namecheap.com, godaddy.com)

---

¡Listo! Tu aplicación estará en producción y accesible desde cualquier lugar del mundo. 🌍🎉
