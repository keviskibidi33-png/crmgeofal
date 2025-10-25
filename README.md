# CRM GEOFAL

Sistema de gestión de clientes, proyectos y cotizaciones para GEOFAL.

## 🚀 Características

- **Gestión de Clientes**: Administración completa de empresas y personas naturales
- **Gestión de Proyectos**: Seguimiento de proyectos con estados y prioridades
- **Cotizaciones Inteligentes**: Sistema de cotizaciones con dependencias automáticas
- **Dashboard**: Estadísticas y métricas en tiempo real
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Reportes**: Generación de reportes PDF y Excel
- **Autenticación**: Sistema de roles y permisos

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **JSReport** - Generación de reportes

### Frontend
- **React** - Biblioteca de UI
- **Vite** - Herramienta de build
- **React Router** - Enrutamiento
- **React Query** - Gestión de estado del servidor
- **Socket.io Client** - Comunicación en tiempo real
- **Bootstrap** - Framework CSS
- **React Bootstrap** - Componentes UI

## 📁 Estructura del Proyecto

```
crmgeofal/
├── backend/                 # Servidor Node.js
│   ├── controllers/         # Controladores de rutas
│   ├── models/             # Modelos de base de datos
│   ├── routes/             # Definición de rutas
│   ├── middlewares/        # Middlewares personalizados
│   ├── services/           # Servicios de negocio
│   ├── migrations/          # Scripts de migración
│   └── utils/               # Utilidades
├── frontend/               # Cliente React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── contexts/       # Contextos de React
│   │   ├── services/       # Servicios de API
│   │   └── utils/          # Utilidades del frontend
│   └── public/             # Archivos estáticos
└── servidor_reportes/      # Servidor de reportes JSReport
```

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Instalación del Backend

```bash
cd backend
npm install
```

### Instalación del Frontend

```bash
cd frontend
npm install
```

### Instalación del Servidor de Reportes

```bash
cd servidor_reportes
npm install
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=crmgeofal
JWT_SECRET=tu_jwt_secret
PORT=4000
```

### Base de Datos

1. Crear la base de datos MySQL
2. Ejecutar las migraciones en `backend/migrations/`

## 🚀 Ejecución

### Desarrollo

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Servidor de Reportes
cd servidor_reportes
npm start
```

### Producción

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 📊 Funcionalidades Principales

### Gestión de Clientes
- Crear, editar y eliminar clientes
- Filtros avanzados por tipo, sector, ciudad
- Importación masiva de clientes
- Historial de actividades

### Gestión de Proyectos
- Estados: Activo, Completado, Pendiente, Cancelado
- Prioridades: Alta, Media, Baja
- Seguimiento de actividades
- Archivos adjuntos

### Cotizaciones Inteligentes
- Sistema de dependencias automáticas
- Cálculo automático de precios
- Generación de PDF
- Aprobaciones por roles

### Dashboard
- Estadísticas en tiempo real
- Gráficos y métricas
- Actividades recientes
- Notificaciones

## 🔐 Roles y Permisos

- **Admin**: Acceso completo al sistema
- **Jefa Comercial**: Gestión comercial y cotizaciones
- **Vendedor Comercial**: Gestión de clientes y cotizaciones
- **Jefe Laboratorio**: Gestión de ensayos y proyectos
- **Usuario Laboratorio**: Ejecución de ensayos

## 📱 API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Clientes
- `GET /api/companies` - Listar clientes
- `POST /api/companies` - Crear cliente
- `PUT /api/companies/:id` - Actualizar cliente
- `DELETE /api/companies/:id` - Eliminar cliente

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `POST /api/quotes` - Crear cotización
- `PUT /api/quotes/:id` - Actualizar cotización
- `DELETE /api/quotes/:id` - Eliminar cotización

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Despliegue

### Docker

```bash
# Construir imagen
docker build -t crmgeofal .

# Ejecutar contenedor
docker run -p 4000:4000 crmgeofal
```

### Docker Compose

```bash
docker-compose up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo**: Equipo de desarrollo GEOFAL
- **Contacto**: admin@crm.com

## 📞 Soporte

Para soporte técnico, contactar a:
- Email: soporte@crm.com
- Teléfono: +51 999 999 999

## 🔄 Changelog

### v1.0.0
- Sistema base implementado
- Gestión de clientes, proyectos y cotizaciones
- Dashboard con estadísticas
- Sistema de notificaciones
- Generación de reportes

### v1.1.0
- Cotizaciones inteligentes con dependencias
- Mejoras en la UI/UX
- Optimización de rendimiento
- Limpieza de logs de debug
