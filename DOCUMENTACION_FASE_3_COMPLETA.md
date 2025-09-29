# 🚀 **DOCUMENTACIÓN COMPLETA FASE 3 - CONEXIÓN VENDEDORES ↔ LABORATORIO**

## **📅 Fecha:** 2025-01-27
## **🎯 Objetivo:** Sistema completo de intercambio de cotizaciones entre vendedores y usuarios de laboratorio con trazabilidad, mapeo por proyectos, y supervisión jerárquica.

---

## **📋 ÍNDICE**

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Backend API](#backend-api)
5. [Frontend](#frontend)
6. [Flujo de Trabajo](#flujo-de-trabajo)
7. [Roles y Permisos](#roles-y-permisos)
8. [Métricas y Dashboards](#métricas-y-dashboards)
9. [Instalación y Configuración](#instalación-y-configuración)
10. [Troubleshooting](#troubleshooting)

---

## **📊 RESUMEN EJECUTIVO**

### **🎯 Objetivo Implementado:**
Sistema completo de intercambio de cotizaciones entre vendedores y usuarios de laboratorio con trazabilidad completa, mapeo por proyectos, y supervisión jerárquica para jefes comerciales y de laboratorio.

### **✅ Funcionalidades Implementadas:**
- **Asignación de cotizaciones** vendedor → laboratorio
- **Gestión de estados** (enviado → recibido → devuelto → completado)
- **Trazabilidad completa** con timestamps y comentarios
- **Mapeo visual por proyectos** con línea de tiempo
- **Métricas analíticas** por vendedor, laboratorio y proyecto
- **Dashboards especializados** por rol
- **Notificaciones automáticas** en cada cambio de estado

### **📈 Beneficios:**
- **Trazabilidad completa** del flujo de cotizaciones
- **Supervisión jerárquica** para jefes
- **Métricas de rendimiento** por equipo
- **Optimización de procesos** laboratorio ↔ ventas
- **Visibilidad total** del estado de proyectos

---

## **🏗️ ARQUITECTURA DEL SISTEMA**

### **🔧 Stack Tecnológico:**
- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React + React Bootstrap + React Router
- **Base de Datos:** PostgreSQL con índices optimizados
- **Autenticación:** JWT (JSON Web Tokens)
- **Notificaciones:** Email + WebSocket + Dashboard

### **📁 Estructura del Proyecto:**
```
crmgeofal/
├── backend/
│   ├── models/quotationFlow.js          # Modelo de flujo de cotizaciones
│   ├── controllers/quotationFlowController.js  # Controladores
│   ├── routes/quotationFlowRoutes.js    # Rutas API
│   └── sql/quotation_flow_system.sql    # Scripts de base de datos
├── frontend/
│   ├── src/pages/VendedorDashboard.jsx      # Dashboard vendedor
│   ├── src/pages/LaboratorioDashboard.jsx   # Dashboard laboratorio
│   └── src/pages/ProjectTrackingDashboard.jsx # Seguimiento proyectos
└── DOCUMENTACION_FASE_3_COMPLETA.md    # Esta documentación
```

---

## **🗄️ BASE DE DATOS**

### **📊 Tablas Implementadas:**

#### **1. quotation_assignments**
```sql
CREATE TABLE quotation_assignments (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL REFERENCES quotes(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    vendedor_id INTEGER NOT NULL REFERENCES users(id),
    laboratorio_user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent',
    received_at TIMESTAMP,
    returned_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. quotation_laboratory_states**
```sql
CREATE TABLE quotation_laboratory_states (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES quotation_assignments(id),
    state VARCHAR(20) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    comments TEXT,
    state_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. project_quotations_tracking**
```sql
CREATE TABLE project_quotations_tracking (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    quotation_id INTEGER NOT NULL REFERENCES quotes(id),
    milestone VARCHAR(50) NOT NULL,
    milestone_date TIMESTAMP DEFAULT NOW(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. vendedor_metrics**
```sql
CREATE TABLE vendedor_metrics (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_quotations_sent INTEGER DEFAULT 0,
    total_quotations_approved INTEGER DEFAULT 0,
    total_quotations_returned INTEGER DEFAULT 0,
    average_response_time DECIMAL(8,2),
    conversion_rate DECIMAL(5,2),
    total_amount_sent DECIMAL(12,2) DEFAULT 0,
    total_amount_approved DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **5. laboratorio_metrics**
```sql
CREATE TABLE laboratorio_metrics (
    id SERIAL PRIMARY KEY,
    laboratorio_user_id INTEGER NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_quotations_received INTEGER DEFAULT 0,
    total_quotations_returned INTEGER DEFAULT 0,
    average_processing_time DECIMAL(8,2),
    efficiency_score DECIMAL(5,2),
    workload_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **6. service_funnel_metrics**
```sql
CREATE TABLE service_funnel_metrics (
    id SERIAL PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    service_category VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    quotations_sent INTEGER DEFAULT 0,
    quotations_approved INTEGER DEFAULT 0,
    quotations_returned INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    total_amount_sent DECIMAL(12,2) DEFAULT 0,
    total_amount_approved DECIMAL(12,2) DEFAULT 0,
    average_processing_time DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **7. quotation_flow_notifications**
```sql
CREATE TABLE quotation_flow_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assignment_id INTEGER REFERENCES quotation_assignments(id),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **🔍 Índices Optimizados:**
```sql
-- Índices para optimización de consultas
CREATE INDEX idx_quotation_assignments_quotation_id ON quotation_assignments(quotation_id);
CREATE INDEX idx_quotation_assignments_project_id ON quotation_assignments(project_id);
CREATE INDEX idx_quotation_assignments_vendedor_id ON quotation_assignments(vendedor_id);
CREATE INDEX idx_quotation_assignments_laboratorio_user_id ON quotation_assignments(laboratorio_user_id);
CREATE INDEX idx_quotation_assignments_status ON quotation_assignments(status);
CREATE INDEX idx_quotation_laboratory_states_assignment_id ON quotation_laboratory_states(assignment_id);
CREATE INDEX idx_project_quotations_tracking_project_id ON project_quotations_tracking(project_id);
CREATE INDEX idx_vendedor_metrics_vendedor_id ON vendedor_metrics(vendedor_id);
CREATE INDEX idx_laboratorio_metrics_laboratorio_user_id ON laboratorio_metrics(laboratorio_user_id);
CREATE INDEX idx_quotation_flow_notifications_user_id ON quotation_flow_notifications(user_id);
```

---

## **🔧 BACKEND API**

### **📡 Endpoints Implementados:**

#### **Gestión de Asignaciones:**
- `POST /api/quotation-flow/assign` - Asignar cotización a laboratorio
- `PUT /api/quotation-flow/assignments/:id/received` - Marcar como recibido
- `PUT /api/quotation-flow/assignments/:id/returned` - Marcar como devuelto
- `PUT /api/quotation-flow/assignments/:id/completed` - Marcar como completado

#### **Consultas por Rol:**
- `GET /api/quotation-flow/vendedor/assignments` - Asignaciones del vendedor
- `GET /api/quotation-flow/laboratorio/assignments` - Asignaciones del laboratorio
- `GET /api/quotation-flow/projects/:id/tracking` - Seguimiento del proyecto

#### **Métricas y Dashboards:**
- `GET /api/quotation-flow/vendedor/metrics` - Métricas del vendedor
- `GET /api/quotation-flow/laboratorio/metrics` - Métricas del laboratorio
- `GET /api/quotation-flow/service-funnel` - Embudo de servicios
- `GET /api/quotation-flow/jefe-comercial/dashboard` - Dashboard jefe comercial
- `GET /api/quotation-flow/jefe-laboratorio/dashboard` - Dashboard jefe laboratorio

### **🔐 Autenticación:**
Todos los endpoints requieren autenticación JWT. El token debe incluirse en el header:
```
Authorization: Bearer <token>
```

### **📊 Modelos de Datos:**

#### **QuotationFlow Model:**
```javascript
// Asignar cotización a laboratorio
await QuotationFlow.assignToLaboratory({
  quotation_id: 123,
  project_id: 456,
  vendedor_id: 789,
  laboratorio_user_id: 101,
  notes: "Urgente - revisar antes del viernes"
});

// Marcar como recibido
await QuotationFlow.markAsReceived(assignment_id, user_id, comments);

// Marcar como devuelto
await QuotationFlow.markAsReturned(assignment_id, user_id, comments);

// Marcar como completado
await QuotationFlow.markAsCompleted(assignment_id, user_id, comments);
```

---

## **🎨 FRONTEND**

### **📱 Componentes Implementados:**

#### **1. VendedorDashboard.jsx**
**Funcionalidades:**
- Dashboard con métricas en tiempo real
- Asignación de cotizaciones a usuarios de laboratorio
- Formulario inteligente con selección de cotizaciones, proyectos y usuarios
- Tabla de asignaciones con estados visuales
- Modal de detalles para seguimiento completo

**Métricas Mostradas:**
- Total de cotizaciones enviadas
- Total de cotizaciones aprobadas
- Total de cotizaciones devueltas
- Tasa de conversión

#### **2. LaboratorioDashboard.jsx**
**Funcionalidades:**
- Dashboard especializado para usuarios de laboratorio
- Gestión de estados (recibido → en progreso → devuelto → completado)
- Acciones contextuales según el estado actual
- Modal de acciones con comentarios
- Seguimiento detallado de cada asignación

**Métricas Mostradas:**
- Total de cotizaciones recibidas
- Total de cotizaciones devueltas
- Tiempo promedio de procesamiento
- Puntuación de eficiencia

#### **3. ProjectTrackingDashboard.jsx**
**Funcionalidades:**
- Vista consolidada de todos los proyectos
- Progreso visual con barras de progreso
- Línea de tiempo detallada por proyecto
- Métricas generales (proyectos activos, cotizaciones, progreso)
- Modal de seguimiento con hitos completos

**Métricas Mostradas:**
- Proyectos activos
- Total de cotizaciones
- Progreso promedio
- Proyectos recientes

### **🔗 Navegación por Rol:**

#### **👑 ADMIN (Acceso Completo):**
- 📤 Dashboard Vendedor
- 🧪 Dashboard Laboratorio
- 📊 Seguimiento Proyectos
- 💼 Panel Facturación
- 📊 Dashboard Jefe Comercial

#### **💼 VENDEDOR COMERCIAL:**
- 📤 Dashboard Vendedor

#### **🧪 USUARIO DE LABORATORIO:**
- 🧪 Dashboard Laboratorio

#### **🧪 JEFE DE LABORATORIO:**
- 🧪 Dashboard Laboratorio
- 📊 Seguimiento Proyectos

---

## **🔄 FLUJO DE TRABAJO**

### **1. Vendedor → Laboratorio**
```
1. Vendedor crea cotización
2. Vendedor asigna cotización a usuario específico de laboratorio
3. Sistema registra asignación con timestamp
4. Notificación automática al usuario de laboratorio
5. Estado: "sent" → "received"
```

### **2. Laboratorio → Vendedor**
```
1. Usuario de laboratorio recibe notificación
2. Marca como "received" con timestamp
3. Procesa la cotización
4. Marca como "returned" o "completed"
5. Notificación automática al vendedor
6. Estado: "received" → "returned" o "completed"
```

### **3. Supervisión Jerárquica**
```
1. Jefe Comercial supervisa vendedores
2. Jefe de Laboratorio supervisa equipo técnico
3. Ambos ven métricas consolidadas
4. Acceso a dashboards especializados
```

### **4. Mapeo por Proyectos**
```
1. Cada cotización vinculada a un proyecto
2. Línea de tiempo con hitos
3. Seguimiento visual del progreso
4. Métricas por proyecto
```

---

## **👥 ROLES Y PERMISOS**

### **🔐 Matriz de Permisos:**

| Funcionalidad | Admin | Vendedor | Laboratorio | Jefe Lab | Jefe Comercial |
|---------------|-------|----------|-------------|----------|-----------------|
| Asignar cotizaciones | ✅ | ✅ | ❌ | ❌ | ❌ |
| Recibir cotizaciones | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cambiar estados | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver métricas propias | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver métricas equipo | ✅ | ❌ | ❌ | ✅ | ✅ |
| Supervisar proyectos | ✅ | ❌ | ❌ | ✅ | ✅ |
| Dashboard completo | ✅ | ❌ | ❌ | ❌ | ❌ |

### **📊 Acceso por Dashboard:**

#### **VendedorDashboard:**
- **Roles:** admin, vendedor_comercial
- **Funcionalidades:** Asignar cotizaciones, ver métricas personales

#### **LaboratorioDashboard:**
- **Roles:** admin, usuario_laboratorio, laboratorio
- **Funcionalidades:** Gestionar asignaciones, cambiar estados

#### **ProjectTrackingDashboard:**
- **Roles:** admin, jefe_comercial, jefe_laboratorio
- **Funcionalidades:** Supervisar proyectos, ver métricas consolidadas

---

## **📈 MÉTRICAS Y DASHBOARDS**

### **📊 Métricas por Vendedor:**
- **Total de cotizaciones enviadas**
- **Total de cotizaciones aprobadas**
- **Total de cotizaciones devueltas**
- **Tiempo promedio de respuesta**
- **Tasa de conversión**
- **Montos totales enviados/aprobados**

### **📊 Métricas por Laboratorio:**
- **Total de cotizaciones recibidas**
- **Total de cotizaciones devueltas**
- **Tiempo promedio de procesamiento**
- **Puntuación de eficiencia**
- **Puntuación de carga de trabajo**

### **📊 Métricas por Proyecto:**
- **Progreso visual con barras**
- **Línea de tiempo con hitos**
- **Métricas consolidadas**
- **Estados visuales con badges**

### **📊 Métricas para Jefes:**
- **Vista consolidada por equipo**
- **Comparativa de desempeño**
- **Embudo de servicios**
- **Métricas de conversión por categoría**

---

## **⚙️ INSTALACIÓN Y CONFIGURACIÓN**

### **🔧 Prerrequisitos:**
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### **📦 Instalación Backend:**
```bash
cd crmgeofal/backend
npm install
npm run dev
```

### **📦 Instalación Frontend:**
```bash
cd crmgeofal/frontend
npm install
npm run dev
```

### **🗄️ Configuración Base de Datos:**
```bash
# Ejecutar scripts SQL
cd crmgeofal/backend
node -e "const pool = require('./config/db'); const fs = require('fs'); const sql = fs.readFileSync('./sql/quotation_flow_system.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Tablas creadas exitosamente'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### **🔐 Variables de Entorno:**
```env
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crmgeofal
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
PORT=4000

# Frontend
VITE_API_URL=http://localhost:4000
```

---

## **🔧 TROUBLESHOOTING**

### **❌ Error 500 en /api/quotes**
**Causa:** Servidor backend no ejecutándose o problema de autenticación
**Solución:**
1. Verificar que el servidor backend esté ejecutándose en puerto 4000
2. Verificar autenticación del usuario
3. Cerrar sesión y volver a loguearse

### **❌ Error "Token requerido"**
**Causa:** Endpoint funcionando correctamente, requiere autenticación
**Solución:**
1. Loguearse en el frontend
2. Verificar que el token se guarde en localStorage
3. Verificar headers de autorización en peticiones

### **❌ Error "Missing script: dev"**
**Causa:** Directorio incorrecto o package.json corrupto
**Solución:**
1. Verificar que estés en el directorio correcto
2. Verificar package.json
3. Ejecutar `npm install` si es necesario

### **❌ Error de conexión a base de datos**
**Causa:** PostgreSQL no ejecutándose o configuración incorrecta
**Solución:**
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar variables de entorno
3. Verificar conexión en config/db.js

---

## **📁 ARCHIVOS PRINCIPALES**

### **Backend:**
- `backend/models/quotationFlow.js` - Modelo de flujo de cotizaciones
- `backend/controllers/quotationFlowController.js` - Controladores
- `backend/routes/quotationFlowRoutes.js` - Rutas API
- `backend/sql/quotation_flow_system.sql` - Scripts de base de datos

### **Frontend:**
- `frontend/src/pages/VendedorDashboard.jsx` - Dashboard vendedor
- `frontend/src/pages/LaboratorioDashboard.jsx` - Dashboard laboratorio
- `frontend/src/pages/ProjectTrackingDashboard.jsx` - Seguimiento proyectos
- `frontend/src/App.jsx` - Rutas actualizadas
- `frontend/src/layout/Sidebar.jsx` - Navegación actualizada

### **Documentación:**
- `DOCUMENTACION_FASE_3_COMPLETA.md` - Esta documentación
- `IMPLEMENTACION_FASE_3_COMPLETA.md` - Implementación backend
- `IMPLEMENTACION_FASE_3_FRONTEND_COMPLETA.md` - Implementación frontend
- `MODULOS_DISPONIBLES_POR_ROL.md` - Módulos por rol

---

## **🎯 CONCLUSIÓN**

### **✅ Fase 3 Implementada al 100%:**
- **Backend:** Servidor funcionando, base de datos conectada, endpoints disponibles
- **Frontend:** Componentes creados, rutas configuradas, navegación actualizada
- **Base de datos:** Tablas creadas con índices optimizados
- **Autenticación:** Sistema de seguridad funcionando

### **🚀 Funcionalidades Disponibles:**
- **Asignación de cotizaciones** vendedor → laboratorio
- **Gestión de estados** con trazabilidad completa
- **Mapeo visual por proyectos** con línea de tiempo
- **Métricas analíticas** por rol y equipo
- **Dashboards especializados** para supervisión
- **Notificaciones automáticas** en cada cambio

### **📊 Beneficios Obtenidos:**
- **Trazabilidad completa** del flujo de cotizaciones
- **Supervisión jerárquica** para jefes
- **Métricas de rendimiento** por equipo
- **Optimización de procesos** laboratorio ↔ ventas
- **Visibilidad total** del estado de proyectos

**El sistema está completamente funcional y listo para usar.**
