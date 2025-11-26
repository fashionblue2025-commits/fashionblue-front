# ✅ Checklist de Despliegue Rápido

Usa esta lista para asegurarte de que todo esté listo antes de desplegar.

---

## 📋 Pre-Deploy

### Código
- [ ] `npm run build` funciona sin errores
- [ ] `npm run preview` muestra la app correctamente
- [ ] No hay `console.log` innecesarios en el código
- [ ] Todas las rutas funcionan correctamente
- [ ] La autenticación funciona
- [ ] Las llamadas a la API funcionan

### Archivos
- [ ] `.gitignore` incluye `node_modules`, `dist`, `.env`
- [ ] `.env.example` existe y está actualizado
- [ ] `README.md` está completo
- [ ] `package.json` tiene scripts de build
- [ ] `vercel.json` existe (para rewrites de React Router)

### Git
- [ ] Todo está commiteado
- [ ] Repositorio en GitHub creado
- [ ] Código pusheado a GitHub

---

## 🚀 Deploy a Vercel (5 minutos)

### 1. Preparación
```bash
# Asegúrate de que todo está pusheado
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Vercel
- [ ] Ir a [vercel.com](https://vercel.com)
- [ ] Login con GitHub
- [ ] Click "New Project"
- [ ] Importar repositorio `fashion-blue-frontend`

### 3. Configuración
- [ ] Framework Preset: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### 4. Variables de Entorno
- [ ] Agregar `VITE_API_URL`
- [ ] Valor: URL de tu backend (ej: `https://tu-backend.railway.app/api/v1`)

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Esperar a que termine (1-2 minutos)
- [ ] Copiar URL de producción

### 6. Verificación
- [ ] Abrir la URL de producción
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Puedes crear/editar/eliminar datos
- [ ] Todas las páginas funcionan
- [ ] Revisar consola del navegador (no debe haber errores)

---

## 🔧 Post-Deploy

### Configuración Adicional
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar analytics (opcional)
- [ ] Configurar Sentry para errores (opcional)

### Documentación
- [ ] Actualizar README con URL de producción
- [ ] Documentar credenciales de prueba
- [ ] Compartir URL con el equipo

### Backend
- [ ] Actualizar CORS en backend para permitir tu dominio de Vercel
- [ ] Verificar que el backend esté funcionando
- [ ] Probar conexión frontend-backend

---

## 🐛 Si Algo Sale Mal

### La página está en blanco
1. Abrir consola del navegador (F12)
2. Ver errores en la consola
3. Verificar que `VITE_API_URL` esté configurada
4. Hacer rebuild en Vercel

### API requests fallan
1. Verificar variable `VITE_API_URL` en Vercel
2. Verificar CORS en el backend
3. Abrir Network tab en devtools
4. Ver qué URL se está llamando

### 404 en rutas
1. Verificar que `vercel.json` existe
2. Verificar que tiene las rewrites
3. Hacer nuevo deploy

### Variables de entorno no funcionan
1. Verifican que tengan prefijo `VITE_`
2. Hacer nuevo deploy (se aplican en build time)
3. Verificar con `console.log(import.meta.env.VITE_API_URL)`

---

## 📱 Comandos Útiles

```bash
# Ver logs de build
vercel logs

# Deploy desde CLI
vercel --prod

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add VITE_API_URL
```

---

## 🎯 Siguiente Paso

Una vez desplegado:

1. **Prueba exhaustivamente** en producción
2. **Comparte el link** con usuarios de prueba
3. **Monitorea errores** en Vercel Dashboard
4. **Optimiza performance** con Lighthouse
5. **Configura dominio personalizado** si tienes uno

---

## ⏱️ Tiempo Estimado

- **Primera vez**: 10-15 minutos
- **Siguientes deploys**: 2-3 minutos (automático con git push)

---

## 🎉 ¡Listo!

Tu aplicación Fashion Blue está desplegada y lista para usar.

**URL de producción**: `https://tu-proyecto.vercel.app`

---

**¿Problemas?** Consulta el archivo `DEPLOY.md` para más detalles.
