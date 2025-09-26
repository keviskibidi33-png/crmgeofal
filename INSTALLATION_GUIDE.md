# Guía de Instalación - CRM GEOFAL

## 🚀 Instalación Rápida

### 1. Requisitos del Sistema
- **Node.js**: v18 o superior
- **PostgreSQL**: v12 o superior
- **Git**: Para clonar el repositorio

### 2. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/crmgeofal.git
cd crmgeofal
```

### 3. Configurar Base de Datos
```bash
# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE postgres OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE postgres TO admin;
\q
```

### 4. Restaurar Base de Datos
```bash
# Ejecutar script de restauración
psql -h localhost -U admin -d postgres -f restore_database.sql
```

### 5. Instalar Dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 6. Configurar Variables de Entorno
```bash
# Backend (.env)
PGUSER=admin
PGHOST=localhost
PGDATABASE=postgres
PGPASSWORD=admin123
PGPORT=5432
JWT_SECRET=mi_secreto_jwt_muy_seguro_para_crmgeofal_2025
```

### 7. Ejecutar Aplicación
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 8. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Usuario**: admin
- **Contraseña**: admin123

## 📋 Verificación de Instalación

### Verificar Base de Datos
```sql
-- Conectar a PostgreSQL
psql -h localhost -U admin -d postgres

-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar servicios
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM subservices;

-- Verificar usuario admin
SELECT username, role FROM users WHERE username = 'admin';
```

### Verificar Backend
```bash
curl http://localhost:4000/api/companies
```

### Verificar Frontend
- Abrir http://localhost:3000
- Iniciar sesión con admin/admin123
- Verificar que se cargan los módulos

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Error de Puerto en Uso
```bash
# Cambiar puerto en backend/index.js
const PORT = process.env.PORT || 4001;

# Cambiar puerto en frontend/vite.config.js
server: { port: 3001 }
```

### Error de Permisos
```bash
# Dar permisos a usuario
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE postgres TO admin;
\q
```

## 📊 Estructura del Proyecto

```
crmgeofal/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── scripts/
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── DATABASE_DOCUMENTATION.md
├── INSTALLATION_GUIDE.md
├── restore_database.sql
└── backup_database.sql
```

## 🎯 Funcionalidades Principales

- ✅ **Gestión de Clientes**: CRUD completo
- ✅ **Gestión de Proyectos**: Seguimiento y control
- ✅ **Cotizaciones**: Creación y exportación PDF/Excel
- ✅ **Laboratorio**: Gestión de servicios y subservicios
- ✅ **Autenticación**: Sistema de roles y permisos
- ✅ **Auditoría**: Registro de cambios automático

## 📞 Soporte

Para problemas o dudas:
1. Revisar logs del servidor
2. Verificar conexión a base de datos
3. Consultar documentación de base de datos
4. Contactar al equipo de desarrollo
