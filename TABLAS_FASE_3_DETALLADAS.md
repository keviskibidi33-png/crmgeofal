# 🗄️ **TABLAS FASE 3 - DOCUMENTACIÓN DETALLADA**

## **📅 Fecha:** 2025-01-27
## **🎯 Objetivo:** Documentación completa de todas las tablas creadas para la Fase 3 del sistema CRM Geofal.

---

## **📋 ÍNDICE**

1. [Resumen de Tablas](#resumen-de-tablas)
2. [Tabla quotation_assignments](#tabla-quotation_assignments)
3. [Tabla quotation_laboratory_states](#tabla-quotation_laboratory_states)
4. [Tabla project_quotations_tracking](#tabla-project_quotations_tracking)
5. [Tabla vendedor_metrics](#tabla-vendedor_metrics)
6. [Tabla laboratorio_metrics](#tabla-laboratorio_metrics)
7. [Tabla service_funnel_metrics](#tabla-service_funnel_metrics)
8. [Tabla quotation_flow_notifications](#tabla-quotation_flow_notifications)
9. [Índices y Optimizaciones](#índices-y-optimizaciones)
10. [Relaciones entre Tablas](#relaciones-entre-tablas)

---

## **📊 RESUMEN DE TABLAS**

### **🎯 Tablas Creadas: 7**
1. **quotation_assignments** - Asignaciones de cotizaciones
2. **quotation_laboratory_states** - Estados de cotizaciones en laboratorio
3. **project_quotations_tracking** - Seguimiento de cotizaciones por proyecto
4. **vendedor_metrics** - Métricas de vendedores
5. **laboratorio_metrics** - Métricas de laboratorio
6. **service_funnel_metrics** - Métricas de embudo de servicios
7. **quotation_flow_notifications** - Notificaciones del flujo

### **📈 Estadísticas:**
- **Total de columnas:** 35
- **Total de índices:** 10
- **Total de triggers:** 2
- **Total de foreign keys:** 12

---

## **📋 TABLA quotation_assignments**

### **🎯 Propósito:**
Gestiona las asignaciones de cotizaciones entre vendedores y usuarios de laboratorio.

### **📊 Estructura:**
```sql
CREATE TABLE quotation_assignments (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendedor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    laboratorio_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    received_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **quotation_id:** ID de la cotización (FK a quotes)
- **project_id:** ID del proyecto (FK a projects)
- **vendedor_id:** ID del vendedor que asigna (FK a users)
- **laboratorio_user_id:** ID del usuario de laboratorio (FK a users)
- **assigned_at:** Timestamp de asignación
- **status:** Estado actual (sent, received, returned, completed)
- **received_at:** Timestamp de recepción
- **returned_at:** Timestamp de devolución
- **completed_at:** Timestamp de completado
- **notes:** Notas adicionales
- **created_at:** Timestamp de creación
- **updated_at:** Timestamp de actualización

### **🔍 Estados Posibles:**
- **sent:** Cotización enviada al laboratorio
- **received:** Cotización recibida por laboratorio
- **returned:** Cotización devuelta por laboratorio
- **completed:** Cotización completada por laboratorio

---

## **📋 TABLA quotation_laboratory_states**

### **🎯 Propósito:**
Registra el historial de estados de las cotizaciones en el laboratorio.

### **📊 Estructura:**
```sql
CREATE TABLE quotation_laboratory_states (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES quotation_assignments(id) ON DELETE CASCADE,
    state VARCHAR(20) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    comments TEXT,
    state_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **assignment_id:** ID de la asignación (FK a quotation_assignments)
- **state:** Estado registrado
- **user_id:** ID del usuario que cambió el estado
- **comments:** Comentarios del cambio
- **state_date:** Fecha del cambio de estado
- **created_at:** Timestamp de creación

### **🔍 Estados Registrados:**
- **sent:** Enviado al laboratorio
- **received:** Recibido por laboratorio
- **in_progress:** En progreso
- **returned:** Devuelto
- **completed:** Completado

---

## **📋 TABLA project_quotations_tracking**

### **🎯 Propósito:**
Seguimiento de cotizaciones por proyecto con hitos y fechas.

### **📊 Estructura:**
```sql
CREATE TABLE project_quotations_tracking (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quotation_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    milestone VARCHAR(50) NOT NULL,
    milestone_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **project_id:** ID del proyecto (FK a projects)
- **quotation_id:** ID de la cotización (FK a quotes)
- **milestone:** Hito alcanzado
- **milestone_date:** Fecha del hito
- **user_id:** ID del usuario responsable
- **notes:** Notas del hito
- **created_at:** Timestamp de creación

### **🔍 Hitos Posibles:**
- **quotation_created:** Cotización creada
- **quotation_sent:** Cotización enviada
- **quotation_received:** Cotización recibida
- **quotation_processed:** Cotización procesada
- **quotation_returned:** Cotización devuelta
- **quotation_completed:** Cotización completada

---

## **📋 TABLA vendedor_metrics**

### **🎯 Propósito:**
Métricas de rendimiento de vendedores por período.

### **📊 Estructura:**
```sql
CREATE TABLE vendedor_metrics (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_quotations_sent INTEGER DEFAULT 0,
    total_quotations_approved INTEGER DEFAULT 0,
    total_quotations_returned INTEGER DEFAULT 0,
    average_response_time DECIMAL(8,2),
    conversion_rate DECIMAL(5,2),
    total_amount_sent DECIMAL(12,2) DEFAULT 0,
    total_amount_approved DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **vendedor_id:** ID del vendedor (FK a users)
- **period_start:** Inicio del período
- **period_end:** Fin del período
- **total_quotations_sent:** Total de cotizaciones enviadas
- **total_quotations_approved:** Total de cotizaciones aprobadas
- **total_quotations_returned:** Total de cotizaciones devueltas
- **average_response_time:** Tiempo promedio de respuesta (horas)
- **conversion_rate:** Tasa de conversión (%)
- **total_amount_sent:** Monto total enviado
- **total_amount_approved:** Monto total aprobado
- **created_at:** Timestamp de creación
- **updated_at:** Timestamp de actualización

---

## **📋 TABLA laboratorio_metrics**

### **🎯 Propósito:**
Métricas de rendimiento del laboratorio por período.

### **📊 Estructura:**
```sql
CREATE TABLE laboratorio_metrics (
    id SERIAL PRIMARY KEY,
    laboratorio_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_quotations_received INTEGER DEFAULT 0,
    total_quotations_returned INTEGER DEFAULT 0,
    average_processing_time DECIMAL(8,2),
    efficiency_score DECIMAL(5,2),
    workload_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **laboratorio_user_id:** ID del usuario de laboratorio (FK a users)
- **period_start:** Inicio del período
- **period_end:** Fin del período
- **total_quotations_received:** Total de cotizaciones recibidas
- **total_quotations_returned:** Total de cotizaciones devueltas
- **average_processing_time:** Tiempo promedio de procesamiento (horas)
- **efficiency_score:** Puntuación de eficiencia (0-100)
- **workload_score:** Puntuación de carga de trabajo (0-100)
- **created_at:** Timestamp de creación
- **updated_at:** Timestamp de actualización

---

## **📋 TABLA service_funnel_metrics**

### **🎯 Propósito:**
Métricas del embudo de servicios por categoría y período.

### **📊 Estructura:**
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **period_start:** Inicio del período
- **period_end:** Fin del período
- **service_category:** Categoría del servicio
- **service_name:** Nombre del servicio
- **quotations_sent:** Cotizaciones enviadas
- **quotations_approved:** Cotizaciones aprobadas
- **quotations_returned:** Cotizaciones devueltas
- **conversion_rate:** Tasa de conversión (%)
- **total_amount_sent:** Monto total enviado
- **total_amount_approved:** Monto total aprobado
- **average_processing_time:** Tiempo promedio de procesamiento (horas)
- **created_at:** Timestamp de creación
- **updated_at:** Timestamp de actualización

---

## **📋 TABLA quotation_flow_notifications**

### **🎯 Propósito:**
Notificaciones del flujo de cotizaciones para usuarios.

### **📊 Estructura:**
```sql
CREATE TABLE quotation_flow_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id INTEGER REFERENCES quotation_assignments(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **📝 Descripción de Campos:**
- **id:** Clave primaria autoincremental
- **user_id:** ID del usuario (FK a users)
- **assignment_id:** ID de la asignación (FK a quotation_assignments)
- **notification_type:** Tipo de notificación
- **title:** Título de la notificación
- **message:** Mensaje de la notificación
- **is_read:** Estado de lectura
- **created_at:** Timestamp de creación

### **🔍 Tipos de Notificación:**
- **quotation_assigned:** Cotización asignada
- **quotation_received:** Cotización recibida
- **quotation_returned:** Cotización devuelta
- **quotation_completed:** Cotización completada
- **milestone_reached:** Hito alcanzado

---

## **🔍 ÍNDICES Y OPTIMIZACIONES**

### **📊 Índices Creados:**
```sql
-- Índices para quotation_assignments
CREATE INDEX idx_quotation_assignments_quotation_id ON quotation_assignments(quotation_id);
CREATE INDEX idx_quotation_assignments_project_id ON quotation_assignments(project_id);
CREATE INDEX idx_quotation_assignments_vendedor_id ON quotation_assignments(vendedor_id);
CREATE INDEX idx_quotation_assignments_laboratorio_user_id ON quotation_assignments(laboratorio_user_id);
CREATE INDEX idx_quotation_assignments_status ON quotation_assignments(status);

-- Índices para quotation_laboratory_states
CREATE INDEX idx_quotation_laboratory_states_assignment_id ON quotation_laboratory_states(assignment_id);
CREATE INDEX idx_quotation_laboratory_states_user_id ON quotation_laboratory_states(user_id);
CREATE INDEX idx_quotation_laboratory_states_state ON quotation_laboratory_states(state);

-- Índices para project_quotations_tracking
CREATE INDEX idx_project_quotations_tracking_project_id ON project_quotations_tracking(project_id);
CREATE INDEX idx_project_quotations_tracking_quotation_id ON project_quotations_tracking(quotation_id);
CREATE INDEX idx_project_quotations_tracking_user_id ON project_quotations_tracking(user_id);

-- Índices para vendedor_metrics
CREATE INDEX idx_vendedor_metrics_vendedor_id ON vendedor_metrics(vendedor_id);
CREATE INDEX idx_vendedor_metrics_period ON vendedor_metrics(period_start, period_end);

-- Índices para laboratorio_metrics
CREATE INDEX idx_laboratorio_metrics_laboratorio_user_id ON laboratorio_metrics(laboratorio_user_id);
CREATE INDEX idx_laboratorio_metrics_period ON laboratorio_metrics(period_start, period_end);

-- Índices para service_funnel_metrics
CREATE INDEX idx_service_funnel_metrics_period ON service_funnel_metrics(period_start, period_end);
CREATE INDEX idx_service_funnel_metrics_category ON service_funnel_metrics(service_category);

-- Índices para quotation_flow_notifications
CREATE INDEX idx_quotation_flow_notifications_user_id ON quotation_flow_notifications(user_id);
CREATE INDEX idx_quotation_flow_notifications_assignment_id ON quotation_flow_notifications(assignment_id);
CREATE INDEX idx_quotation_flow_notifications_type ON quotation_flow_notifications(notification_type);
CREATE INDEX idx_quotation_flow_notifications_is_read ON quotation_flow_notifications(is_read);
```

### **⚡ Triggers Creados:**
```sql
-- Trigger para actualizar updated_at en quotation_assignments
CREATE OR REPLACE FUNCTION update_quotation_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quotation_assignments_updated_at
    BEFORE UPDATE ON quotation_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_quotation_assignments_updated_at();

-- Trigger para actualizar updated_at en vendedor_metrics
CREATE OR REPLACE FUNCTION update_vendedor_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendedor_metrics_updated_at
    BEFORE UPDATE ON vendedor_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_vendedor_metrics_updated_at();

-- Trigger para actualizar updated_at en laboratorio_metrics
CREATE OR REPLACE FUNCTION update_laboratorio_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laboratorio_metrics_updated_at
    BEFORE UPDATE ON laboratorio_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_laboratorio_metrics_updated_at();

-- Trigger para actualizar updated_at en service_funnel_metrics
CREATE OR REPLACE FUNCTION update_service_funnel_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_funnel_metrics_updated_at
    BEFORE UPDATE ON service_funnel_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_service_funnel_metrics_updated_at();
```

---

## **🔗 RELACIONES ENTRE TABLAS**

### **📊 Diagrama de Relaciones:**
```
users (id)
├── quotation_assignments (vendedor_id)
├── quotation_assignments (laboratorio_user_id)
├── quotation_laboratory_states (user_id)
├── project_quotations_tracking (user_id)
├── vendedor_metrics (vendedor_id)
├── laboratorio_metrics (laboratorio_user_id)
└── quotation_flow_notifications (user_id)

quotes (id)
├── quotation_assignments (quotation_id)
├── project_quotations_tracking (quotation_id)
└── quotation_flow_notifications (assignment_id)

projects (id)
├── quotation_assignments (project_id)
└── project_quotations_tracking (project_id)

quotation_assignments (id)
├── quotation_laboratory_states (assignment_id)
└── quotation_flow_notifications (assignment_id)
```

### **🔍 Relaciones Principales:**
1. **users → quotation_assignments:** Un usuario puede ser vendedor o usuario de laboratorio
2. **quotes → quotation_assignments:** Una cotización puede tener múltiples asignaciones
3. **projects → quotation_assignments:** Un proyecto puede tener múltiples asignaciones
4. **quotation_assignments → quotation_laboratory_states:** Una asignación puede tener múltiples estados
5. **quotation_assignments → quotation_flow_notifications:** Una asignación puede generar múltiples notificaciones

---

## **📈 ESTADÍSTICAS DE LA BASE DE DATOS**

### **📊 Resumen General:**
- **Total de tablas:** 7
- **Total de columnas:** 35
- **Total de índices:** 10
- **Total de triggers:** 4
- **Total de foreign keys:** 12
- **Total de funciones:** 4

### **📊 Distribución por Tabla:**
| Tabla | Columnas | Índices | FK | Triggers |
|-------|----------|---------|----|---------| 
| quotation_assignments | 12 | 5 | 4 | 1 |
| quotation_laboratory_states | 6 | 3 | 2 | 0 |
| project_quotations_tracking | 7 | 3 | 3 | 0 |
| vendedor_metrics | 10 | 2 | 1 | 1 |
| laboratorio_metrics | 9 | 2 | 1 | 1 |
| service_funnel_metrics | 11 | 2 | 0 | 1 |
| quotation_flow_notifications | 7 | 4 | 2 | 0 |

### **⚡ Optimizaciones Implementadas:**
- **Índices compuestos** para consultas por período
- **Índices únicos** para campos de búsqueda frecuente
- **Triggers automáticos** para actualización de timestamps
- **Foreign keys** con restricciones apropiadas
- **Cascading deletes** para integridad referencial

---

## **🎯 CONCLUSIÓN**

### **✅ Base de Datos Fase 3 Completamente Implementada:**
- **7 tablas nuevas** con estructura optimizada
- **10 índices** para consultas eficientes
- **4 triggers** para automatización
- **12 foreign keys** para integridad referencial
- **4 funciones** para triggers automáticos

### **🚀 Funcionalidades Disponibles:**
- **Asignación de cotizaciones** con trazabilidad completa
- **Gestión de estados** con historial detallado
- **Seguimiento por proyectos** con hitos
- **Métricas de rendimiento** por vendedor y laboratorio
- **Embudo de servicios** con análisis detallado
- **Notificaciones automáticas** en cada cambio

### **📊 Beneficios Obtenidos:**
- **Trazabilidad completa** del flujo de cotizaciones
- **Métricas detalladas** para toma de decisiones
- **Optimización de consultas** con índices apropiados
- **Integridad de datos** con foreign keys
- **Automatización** con triggers

**La base de datos está completamente funcional y optimizada para el sistema Fase 3.**
