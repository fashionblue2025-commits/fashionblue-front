# 🛍️ Fashion Blue - Frontend

Frontend moderno para el sistema de gestión de Fashion Blue, desarrollado con React + Vite y TailwindCSS.

## 🎨 Diseño

El diseño está basado en los colores de marca de Fashion Blue:
- **Azul principal**: `#1DA1F2` (del logo)
- **Degradado**: Azul → Púrpura → Rosa/Magenta
- **UI moderna** con TailwindCSS
- **Iconos** con Lucide React
- **Responsive** para móvil, tablet y desktop

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd fashion-blue-front
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 📦 Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool ultrarrápido
- **React Router DOM** - Enrutamiento
- **TailwindCSS** - Estilos utility-first
- **Lucide React** - Iconos modernos
- **Axios** - Cliente HTTP
- **Zustand** - State management
- **React Hook Form** - Manejo de formularios
- **date-fns** - Manejo de fechas

## 📁 Estructura del Proyecto

```
fashion-blue-front/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   └── Layout/       # Layout principal con sidebar
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Auth/         # Login, Register
│   │   ├── Dashboard/    # Dashboard principal
│   │   ├── Products/     # Gestión de productos
│   │   └── Orders/       # Gestión de órdenes
│   ├── services/         # Servicios API
│   │   ├── api.js        # Cliente axios configurado
│   │   ├── authService.js
│   │   ├── orderService.js
│   │   └── productService.js
│   ├── store/            # Estado global (Zustand)
│   │   └── authStore.js  # Store de autenticación
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Entry point
│   └── index.css         # Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación
- [x] Login con email y contraseña
- [x] Persistencia de sesión (localStorage)
- [x] Protección de rutas privadas
- [x] Logout

### ✅ Dashboard
- [x] Estadísticas generales
- [x] Órdenes recientes
- [x] Cards de métricas
- [x] Navegación rápida

### ✅ Layout
- [x] Sidebar responsive
- [x] Navegación móvil
- [x] Header con usuario
- [x] Menú de navegación

### 🚧 En Desarrollo
- [ ] Gestión completa de productos
- [ ] Gestión completa de órdenes
- [ ] Subida de fotos múltiples
- [ ] Filtros y búsqueda
- [ ] Reportes y gráficas

## 🔐 Credenciales de Prueba

```
Email: admin@fashionblue.com
Password: admin123
```

## 🎨 Colores de Marca

```javascript
// Tailwind config
colors: {
  primary: {
    500: '#1DA1F2', // Azul principal
    // ... más tonos
  },
  secondary: {
    500: '#E91E63', // Rosa/Magenta
  },
  accent: {
    500: '#9C27B0', // Púrpura
  },
}

// Degradado de marca
bg-gradient-brand: linear-gradient(135deg, #1DA1F2 0%, #9C27B0 50%, #E91E63 100%)
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🔗 Integración con Backend

El frontend se conecta al backend de Fashion Blue a través de la API REST.

### Configuración del Proxy

Vite está configurado para hacer proxy de las peticiones `/api` al backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

### Servicios API

Todos los servicios están en `src/services/`:

```javascript
// Ejemplo de uso
import { orderService } from './services/orderService'

// Obtener órdenes
const orders = await orderService.getOrders()

// Crear orden
const newOrder = await orderService.createOrder(orderData)

// Subir fotos
await orderService.uploadPhotos(orderId, files, descriptions)
```

## 🚀 Deploy

### Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/`.

### Variables de Entorno para Producción

```env
VITE_API_URL=https://api.fashionblue.com/api/v1
```

## 🎨 Componentes Reutilizables

### Botones

```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-gradient">Gradient</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-outline">Outline</button>
```

### Inputs

```jsx
<input className="input" />
<input className="input input-error" />
```

### Cards

```jsx
<div className="card">Content</div>
<div className="card card-hover">Hoverable</div>
```

### Badges

```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

## 📱 Responsive Design

El diseño es completamente responsive:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Troubleshooting

### El frontend no se conecta al backend

1. Verificar que el backend esté corriendo en `http://localhost:8080`
2. Revisar la variable `VITE_API_URL` en `.env`
3. Verificar CORS en el backend

### Error de autenticación

1. Verificar credenciales
2. Revisar que el token se esté guardando en localStorage
3. Verificar que el backend esté aceptando el token

### Estilos no se aplican

1. Verificar que TailwindCSS esté instalado: `npm install`
2. Reiniciar el servidor de desarrollo

## 📄 Licencia

© 2024 Fashion Blue. Todos los derechos reservados.

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Crear una rama feature
2. Hacer cambios
3. Commit con mensajes descriptivos
4. Push y crear Pull Request

## 🎉 ¡Listo!

El frontend de Fashion Blue está listo para usar. Solo necesitas:

1. `npm install`
2. `cp .env.example .env`
3. `npm run dev`

¡Disfruta! 🚀
