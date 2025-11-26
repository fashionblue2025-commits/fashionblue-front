# 🚀 Guía de Despliegue - Fashion Blue Frontend

Esta guía te ayudará a desplegar tu aplicación React en diferentes plataformas.

---

## 📋 Índice

1. [Preparación](#preparación)
2. [Vercel (Recomendado)](#vercel-recomendado)
3. [Netlify](#netlify)
4. [Railway](#railway)
5. [Docker](#docker)
6. [Variables de Entorno](#variables-de-entorno)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Preparación

### 1. Verificar que todo funcione localmente

```bash
# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env

# Editar .env con tu backend
# VITE_API_URL=http://localhost:8080/api/v1

# Probar en desarrollo
npm run dev

# Probar build de producción
npm run build
npm run preview
```

### 2. Subir a GitHub

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit: Fashion Blue Frontend"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/fashion-blue-frontend.git
git branch -M main
git push -u origin main
```

---

## 🏆 Vercel (Recomendado)

**✅ Ventajas:**
- Gratis para proyectos personales
- Deploy automático desde GitHub
- SSL gratuito
- CDN global ultra rápido
- Optimizado para Vite/React
- Variables de entorno fáciles

### Pasos:

1. **Ir a [vercel.com](https://vercel.com)**

2. **Login con GitHub**

3. **New Project → Import Git Repository**

4. **Selecciona tu repo** `fashion-blue-frontend`

5. **Configuración:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Variables de Entorno:**
   - Click en "Environment Variables"
   - Agregar:
     ```
     Name: VITE_API_URL
     Value: https://tu-api-backend.com/api/v1
     ```

7. **Deploy** 🚀

8. **Tu app estará en:**
   ```
   https://tu-proyecto.vercel.app
   ```

### Deploy Automático

Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente los cambios.

### Dominios Personalizados

1. En el dashboard de Vercel → Settings → Domains
2. Agregar tu dominio (ej: `fashionblue.com`)
3. Configurar DNS según las instrucciones
4. ¡Listo! SSL automático incluido

---

## ⚡ Netlify

**✅ Ventajas:**
- También gratis
- Forms y Functions serverless
- Split testing A/B

### Pasos:

1. **Ir a [netlify.com](https://netlify.com)**

2. **Login con GitHub**

3. **Sites → Add new site → Import an existing project**

4. **Conectar con GitHub** y selecciona tu repo

5. **Configuración:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

6. **Environment Variables:**
   - Site settings → Environment variables → Add a variable
   - Agregar:
     ```
     Key: VITE_API_URL
     Value: https://tu-api-backend.com/api/v1
     ```

7. **Deploy site** 🚀

### Archivo netlify.toml (Opcional)

Crea un archivo `netlify.toml` en la raíz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 🚂 Railway

**✅ Ventajas:**
- Perfecto para desplegar backend + frontend juntos
- $5 gratis al mes
- Base de datos incluida

### Pasos:

1. **Ir a [railway.app](https://railway.app)**

2. **Login con GitHub**

3. **New Project → Deploy from GitHub repo**

4. **Selecciona tu repo**

5. **Add variables:**
   ```
   VITE_API_URL=https://tu-backend.railway.app/api/v1
   ```

6. **Settings:**
   ```
   Build Command: npm run build
   Start Command: npx vite preview --host 0.0.0.0 --port $PORT
   ```

7. **Deploy** 🚀

---

## 🐳 Docker

### Usando Docker Compose (Desarrollo Local)

```bash
# Build y correr
docker-compose up --build

# Acceder a:
http://localhost:3000
```

### Build Manual

```bash
# Build de la imagen
docker build -t fashion-blue-frontend .

# Correr contenedor
docker run -p 3000:80 \
  -e VITE_API_URL=https://tu-backend.com/api/v1 \
  fashion-blue-frontend
```

### Deploy a Producción

**Digital Ocean, AWS, Google Cloud, etc:**

```bash
# 1. Build de la imagen
docker build -t fashion-blue-frontend .

# 2. Tag para tu registry
docker tag fashion-blue-frontend tu-registry/fashion-blue-frontend:latest

# 3. Push
docker push tu-registry/fashion-blue-frontend:latest

# 4. En tu servidor
docker pull tu-registry/fashion-blue-frontend:latest
docker run -d -p 80:80 \
  -e VITE_API_URL=https://api.fashionblue.com/api/v1 \
  --name fashion-blue-frontend \
  tu-registry/fashion-blue-frontend:latest
```

---

## 🔐 Variables de Entorno

### Desarrollo (.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Producción

Dependiendo de dónde esté tu backend:

```env
# Mismo servidor
VITE_API_URL=https://tudominio.com/api/v1

# Railway
VITE_API_URL=https://tu-backend.railway.app/api/v1

# Vercel Functions
VITE_API_URL=https://api.tudominio.com/api/v1

# Custom
VITE_API_URL=https://api.fashionblue.com/api/v1
```

### Importante ⚠️

- **SIEMPRE** usa el prefijo `VITE_` para que Vite las exponga
- **NUNCA** pongas secretos en variables de frontend
- Las variables de entorno se construyen en BUILD time, no runtime

---

## 🧪 Verificación Pre-Deploy

Checklist antes de desplegar:

```bash
# ✅ Build de producción funciona
npm run build

# ✅ Preview del build
npm run preview

# ✅ No hay errores de linting
npm run lint

# ✅ .env.example existe y está actualizado
cat .env.example

# ✅ .gitignore incluye .env
cat .gitignore | grep .env

# ✅ README actualizado
cat README.md

# ✅ No hay console.logs innecesarios
grep -r "console.log" src/

# ✅ API_URL apunta a producción
echo $VITE_API_URL
```

---

## 🔧 Troubleshooting

### Error: API requests failing

**Problema:** Las llamadas a la API fallan en producción

**Solución:**
1. Verifica la variable `VITE_API_URL` en tu plataforma
2. Asegúrate de que el backend tenga CORS configurado:
   ```go
   // backend/main.go
   router.Use(cors.New(cors.Config{
       AllowOrigins:     []string{"https://tu-frontend.vercel.app"},
       AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
       AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
       AllowCredentials: true,
   }))
   ```

### Error: Blank page after deploy

**Problema:** La página aparece en blanco

**Solución:**
1. Verifica que el `build` se haya completado correctamente
2. Revisa la consola del navegador (F12)
3. Asegúrate de que el `Output Directory` sea `dist`
4. Verifica que el archivo `index.html` esté en `dist/`

### Error: 404 en rutas

**Problema:** Rutas de React Router devuelven 404

**Solución en Vercel:**
Crea `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Solución en Netlify:**
Ya está manejado por el archivo `netlify.toml` o crea `_redirects`:
```
/*    /index.html   200
```

### Error: Variables de entorno no funcionan

**Problema:** `import.meta.env.VITE_API_URL` es `undefined`

**Solución:**
1. Asegúrate de que la variable tenga el prefijo `VITE_`
2. Verifica que la variable esté configurada en la plataforma
3. Haz un nuevo deploy (las variables se aplican en build time)
4. Verifica en el código:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL)
   ```

---

## 🎯 Configuración Recomendada por Tamaño

### Proyecto Personal / Demo
→ **Vercel** (gratis, fácil, rápido)

### Startup / Producto Real
→ **Vercel Pro** ($20/mes) o **Netlify Pro** ($19/mes)

### Empresa Grande
→ **AWS CloudFront + S3** o **Google Cloud CDN**

### Full Control
→ **VPS + Docker + Nginx** (DigitalOcean, Linode, etc.)

---

## 📊 Comparación de Plataformas

| Plataforma | Precio | Deploy Automático | SSL | CDN | Dificultad |
|-----------|--------|-------------------|-----|-----|-----------|
| **Vercel** | Gratis | ✅ | ✅ | ✅ | ⭐ Fácil |
| **Netlify** | Gratis | ✅ | ✅ | ✅ | ⭐ Fácil |
| **Railway** | $5/mes | ✅ | ✅ | ❌ | ⭐⭐ Media |
| **Docker/VPS** | Variable | ❌ | Manual | ❌ | ⭐⭐⭐ Difícil |

---

## 🚀 Next Steps

Después de desplegar:

1. **Configurar dominio personalizado**
2. **Configurar analytics** (Google Analytics, Vercel Analytics)
3. **Configurar monitoring** (Sentry para errores)
4. **Optimizar performance** (Lighthouse)
5. **Configurar CI/CD** (GitHub Actions)

---

## 📞 Soporte

Si tienes problemas:
- Vercel: https://vercel.com/support
- Netlify: https://docs.netlify.com
- Railway: https://docs.railway.app

---

**¡Felicidades por tu deploy!** 🎉

Tu aplicación Fashion Blue está ahora en producción y lista para ser usada. 🚀
