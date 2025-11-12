# 🍳 Gestión de Cocina - Sistema de Inventario y Costos

Aplicación web completa para administrar tu cocina, controlar inventario de ingredientes, crear recetas y calcular costos y ganancias automáticamente.

**✨ NUEVA VERSIÓN con MongoDB**: Los datos ahora se almacenan en una base de datos MongoDB real en lugar de localStorage.

## 🏗️ Arquitectura

- **Frontend**: HTML, CSS, JavaScript vanilla (Puerto 3000)
- **Backend**: Node.js + Express (Puerto 8080)
- **Base de Datos**: MongoDB

## ✨ Características Principales

### 📦 Gestión de Ingredientes
- Agregar, editar y eliminar ingredientes
- Registrar cantidad, unidad de medida y costo de compra
- Cálculo automático del costo por unidad
- Tabla organizada con todos tus ingredientes

### 🍳 Gestión de Recetas
- Crear recetas con múltiples ingredientes
- Indicar cuántas porciones produce cada receta
- Agregar costo de empaquetado
- **Cálculo automático del costo total** basado en los ingredientes utilizados
- Costo por porción calculado automáticamente
- Ver detalles completos de cada receta

### 💰 Análisis de Costos y Ganancias
- Desglose completo de costos (ingredientes + empaquetado)
- Precio de venta sugerido con margen del 200%
- Cálculo de ganancia por porción
- **Calculadora personalizada** para:
  - Establecer tu propio precio de venta
  - Calcular ganancias para múltiples porciones
  - Ver inversión total vs ingreso total vs ganancia
- Porcentaje de margen de ganancia
- Identificación de pérdidas (si el precio es muy bajo)

### 💾 Persistencia de Datos
- **Base de datos MongoDB** para almacenamiento permanente y confiable
- API REST completa para gestionar ingredientes y recetas
- Los datos persisten aunque cierres el navegador o cambies de dispositivo
- Puedes acceder desde múltiples dispositivos a la misma base de datos

## 🚀 Cómo Usar

### Requisitos Previos

1. **Node.js** (versión 14 o superior)
2. **MongoDB** instalado y corriendo localmente, o usar MongoDB Atlas (gratuito)
3. **npm** (viene con Node.js)

### Instalación y Configuración

#### 1. Instalar MongoDB

**En Ubuntu/Debian:**
```bash
# Importar clave pública de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Crear lista de fuentes
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**En macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**En Windows:**
- Descarga el instalador desde [mongodb.com](https://www.mongodb.com/try/download/community)
- Ejecuta el instalador y sigue las instrucciones

**O usa MongoDB Atlas (nube - gratis):**
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Úsalo en el archivo `.env` del backend

#### 2. Configurar el Backend

```bash
# Navega a la carpeta del backend
cd backend

# Instala las dependencias
npm install

# Crea el archivo .env (ya existe, pero verifica la configuración)
# El archivo debe contener:
# MONGODB_URI=mongodb://localhost:27017/inventario-cocina
# PORT=8080
# NODE_ENV=development
# FRONTEND_URL=http://localhost:3000

# Inicia el servidor backend
npm start

# O para desarrollo con auto-reload:
npm run dev
```

El backend estará corriendo en **http://localhost:8080**

#### 3. Iniciar el Frontend

```bash
# Desde la carpeta raíz del proyecto
cd /home/glo_suarez/inventario

# Inicia un servidor HTTP simple
python3 -m http.server 3000

# O con Node.js
npx http-server -p 3000
```

El frontend estará disponible en **http://localhost:3000**

### Opción Alternativa: Sin Backend (Solo localStorage)

Si no quieres usar MongoDB, puedes usar la versión anterior con localStorage:
1. Comenta o elimina la línea `const API_URL = 'http://localhost:8080/api';` en `app.js`
2. Restaura las funciones originales de localStorage
3. Abre `index.html` directamente en tu navegador

## 📖 Guía de Uso

### 1️⃣ Agregar Ingredientes

1. Ve a la pestaña **"Ingredientes"**
2. Haz clic en **"+ Nuevo Ingrediente"**
3. Completa el formulario:
   - **Nombre**: Ejemplo: "Harina de trigo"
   - **Cantidad**: Ejemplo: 5 (kg)
   - **Unidad**: Selecciona kg, g, l, ml, unidad, pieza
   - **Costo Total**: Lo que pagaste por esa cantidad, ejemplo: $45.00
   - El **Costo por Unidad** se calcula automáticamente
4. Haz clic en **"Guardar"**

**Consejos:**
- Registra todos tus ingredientes antes de crear recetas
- Puedes editar o eliminar ingredientes en cualquier momento
- El costo por unidad te ayuda a saber exactamente cuánto gastas de cada ingrediente

### 2️⃣ Crear Recetas

1. Ve a la pestaña **"Recetas"**
2. Haz clic en **"+ Nueva Receta"**
3. Completa la información básica:
   - **Nombre**: Ejemplo: "Pastel de chocolate"
   - **Descripción**: (opcional) Detalles o notas
   - **Porciones**: Cuántas porciones produce la receta
4. Agrega ingredientes:
   - Selecciona un ingrediente del menú desplegable
   - Ingresa la cantidad que usa tu receta
   - Haz clic en **"Agregar"**
   - Repite para todos los ingredientes
5. Agrega el **Costo de Empaquetado** (cajas, bolsas, etiquetas, etc.)
6. El **Costo Total** y **Costo por Porción** se calculan automáticamente
7. Haz clic en **"Guardar Receta"**

**Consejos:**
- Si te equivocas en un ingrediente, elimínalo con el botón ❌ y agrégalo de nuevo
- El costo de empaquetado es importante para saber tu inversión real
- Puedes ver cuánto cuesta cada ingrediente en la lista

### 3️⃣ Analizar Costos y Ganancias

1. Ve a la pestaña **"Análisis de Costos"**
2. Verás todas tus recetas con:
   - **Inversión por porción**: Cuánto gastas en hacer cada porción
   - **Precio sugerido de venta**: Recomendación con 200% de margen
   - **Ganancia por porción**: Cuánto ganarías
3. Usa la **Calculadora Personalizada**:
   - Ingresa tu **precio de venta deseado**
   - Ingresa cuántas **porciones planeas vender**
   - Ve instantáneamente:
     - Inversión total
     - Ingreso total
     - Ganancia total (o pérdida si el precio es muy bajo)

**Consejos:**
- El precio sugerido tiene un margen del 200% (si inviertes $10, vendes en $30)
- Ajusta el precio según tu mercado y competencia
- La calculadora te ayuda a simular diferentes escenarios de venta
- Si aparece en rojo, significa que tendrías pérdidas con ese precio

## 📊 Ejemplo Práctico

### Ejemplo: Brownies Caseros

**Ingredientes agregados:**
- Harina: 1kg por $25.00 → $0.025/g
- Azúcar: 1kg por $18.00 → $0.018/g
- Cacao: 500g por $65.00 → $0.13/g
- Huevos: 18 unidades por $60.00 → $3.33/unidad
- Mantequilla: 500g por $85.00 → $0.17/g

**Receta: Brownies (12 porciones)**
- Harina: 200g → $5.00
- Azúcar: 250g → $4.50
- Cacao: 100g → $13.00
- Huevos: 3 unidades → $10.00
- Mantequilla: 150g → $25.50
- Empaquetado: $15.00 (cajas individuales)
- **Costo Total**: $73.00
- **Costo por Porción**: $6.08

**Análisis de Ganancia:**
- Precio sugerido: $18.24 por brownie
- Ganancia: $12.16 por brownie
- Si vendes las 12 porciones: **$145.92 de ganancia**

## 🗂️ Estructura del Proyecto

```
inventario/
├── index.html              # Interfaz principal de la aplicación
├── app.js                  # Lógica del frontend con integración API
├── styles.css              # Estilos y diseño responsivo
├── README.md               # Esta documentación
└── backend/
    ├── server.js           # Servidor Express principal
    ├── package.json        # Dependencias del backend
    ├── .env                # Variables de entorno (NO subir a git)
    ├── .env.example        # Ejemplo de configuración
    ├── models/
    │   ├── Ingrediente.js  # Modelo de ingredientes
    │   └── Receta.js       # Modelo de recetas
    └── routes/
        ├── ingredientes.js # Rutas API para ingredientes
        └── recetas.js      # Rutas API para recetas
```

## 🔌 API Endpoints

### Ingredientes

- `GET /api/ingredientes` - Obtener todos los ingredientes
- `GET /api/ingredientes/:id` - Obtener un ingrediente específico
- `POST /api/ingredientes` - Crear nuevo ingrediente
- `PUT /api/ingredientes/:id` - Actualizar ingrediente
- `DELETE /api/ingredientes/:id` - Eliminar ingrediente

### Recetas

- `GET /api/recetas` - Obtener todas las recetas
- `GET /api/recetas/:id` - Obtener una receta específica
- `POST /api/recetas` - Crear nueva receta
- `PUT /api/recetas/:id` - Actualizar receta
- `DELETE /api/recetas/:id` - Eliminar receta

### Utilidad

- `GET /api/health` - Verificar estado de la API y conexión a MongoDB

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# URI de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/inventario-cocina
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/inventario-cocina

# Puerto del servidor backend
PORT=8080

# Ambiente
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

## 🌐 Despliegue en Producción

### Backend (API + MongoDB)

#### Opción 1: Railway.app (Recomendado - Gratuito)

1. Crea una cuenta en [Railway](https://railway.app)
2. Instala Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Despliega el backend:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```
4. Agrega MongoDB en Railway:
   - Ve a tu proyecto en Railway
   - Click en "New" → "Database" → "MongoDB"
   - Copia la connection string a tus variables de entorno

#### Opción 2: Render.com (Gratuito)

1. Sube tu código a GitHub
2. Ve a [Render](https://render.com) y crea una cuenta
3. Crea un nuevo "Web Service"
4. Conecta tu repositorio
5. Configura:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Variables de entorno (agregar en Render):
     - `MONGODB_URI`: tu URI de MongoDB Atlas
     - `PORT`: 8080
     - `FRONTEND_URL`: URL de tu frontend
6. Crea una base de datos MongoDB en MongoDB Atlas (gratis)

#### Opción 3: Heroku

```bash
# Instala Heroku CLI
cd backend
heroku login
heroku create mi-app-cocina-backend
heroku addons:create mongolab:sandbox
git push heroku main
```

### Frontend

#### GitHub Pages (Gratis)

1. Sube tu proyecto a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama `main` y la carpeta raíz
4. **IMPORTANTE**: Actualiza `API_URL` en `app.js` con la URL de tu backend desplegado
5. Tu app estará en `https://tu-usuario.github.io/nombre-repo`

#### Netlify (Gratis)

1. Actualiza `API_URL` en `app.js` con la URL de tu backend
2. Arrastra la carpeta del proyecto a [Netlify Drop](https://app.netlify.com/drop)
3. O conecta con GitHub para deploys automáticos

#### Vercel (Gratis)

```bash
npm install -g vercel
# Actualiza API_URL en app.js primero
vercel
```

### MongoDB en la Nube (Gratuito)

**MongoDB Atlas** ofrece 512MB gratis:

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster (elige el tier gratuito)
4. Crea un usuario de base de datos
5. Configura IP whitelist (0.0.0.0/0 para acceso desde cualquier lugar)
6. Obtén tu connection string
7. Actualiza `MONGODB_URI` en tu `.env` o variables de entorno del hosting

## 💡 Tips y Mejores Prácticas

### Para Ingredientes
- Actualiza los precios regularmente cuando haya cambios
- Usa unidades consistentes (si compras en kg, registra en kg)
- Guarda los recibos de compra para verificar precios

### Para Recetas
- Sé preciso con las cantidades para cálculos exactos
- Incluye todos los costos (no olvides el empaquetado)
- Considera hacer recetas de prueba para ajustar cantidades

### Para Precios
- Investiga los precios de la competencia
- Considera el tiempo de preparación en tu precio
- El margen del 200% es estándar, pero ajusta según tu mercado
- No olvides incluir costos de luz, gas y mano de obra

### Para el Negocio
- Exporta tus datos regularmente (usa el botón de exportar del navegador)
- Haz copias de seguridad del localStorage
- Actualiza costos al menos una vez al mes
- Prueba diferentes escenarios de precio en el análisis

## 🔧 Soporte Técnico

### El backend no inicia

- Verifica que MongoDB esté corriendo: `sudo systemctl status mongod` (Linux) o `brew services list` (macOS)
- Verifica que el puerto 8080 no esté en uso: `lsof -i :8080`
- Revisa que las dependencias estén instaladas: `cd backend && npm install`
- Verifica la conexión a MongoDB en el archivo `.env`

### El frontend no se conecta al backend

- Asegúrate de que el backend esté corriendo en http://localhost:8080
- Verifica que `API_URL` en `app.js` apunte a `http://localhost:8080/api`
- Revisa la consola del navegador (F12) para ver errores de CORS o red
- Verifica que CORS esté configurado correctamente en el backend

### Error de CORS

- Asegúrate de que `FRONTEND_URL` en `.env` del backend coincida con la URL de tu frontend
- El backend ya tiene CORS configurado, pero verifica que el puerto coincida

### MongoDB no se conecta

- Verifica que MongoDB esté corriendo: `mongosh` para probar la conexión
- Si usas MongoDB Atlas, verifica tu IP whitelist
- Revisa que el `MONGODB_URI` en `.env` sea correcto
- Prueba la conexión desde terminal: `mongosh "tu-connection-string"`

### Los datos no se guardan

- Verifica que el backend esté corriendo y respondiendo
- Abre http://localhost:8080/api/health para verificar el estado
- Revisa la consola del navegador para errores
- Verifica que MongoDB esté aceptando conexiones

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles (iOS/Android)
- ✅ Tablets

## 🔐 Privacidad y Seguridad

- Los datos se almacenan en **tu propia base de datos MongoDB**
- Si usas MongoDB local, los datos nunca salen de tu computadora
- Si usas MongoDB Atlas, los datos están encriptados en tránsito y en reposo
- El backend incluye validación de datos para prevenir inyecciones
- **Recomendación**: En producción, agrega autenticación y autorización (JWT)
- No expongas tus credenciales de MongoDB en repositorios públicos

## 📄 Licencia

Este proyecto es de uso libre. Puedes modificarlo y adaptarlo a tus necesidades.

## 🤝 Contribuciones

Si deseas agregar funcionalidades:
- Export/Import de datos en CSV
- Gráficos de costos y ganancias
- Historial de precios de ingredientes
- Calculadora de recetas escalables
- Base de datos en servidor

## 📞 Contacto

Para soporte o sugerencias, crea un issue en el repositorio.

---

**¡Disfruta administrando tu cocina de manera profesional! 🎉👨‍🍳👩‍🍳**
