# PLAN FASE 2 MEJORADO - MÓDULOS EXISTENTES

## 🎯 **OBJETIVO ESPECÍFICO**

Mejorar y expandir los módulos existentes del CRM con las 4 áreas prioritarias identificadas, manteniendo la funcionalidad actual y agregando características avanzadas.

## 📋 **MÓDULOS A MEJORAR**

### **1. MÓDULO COTIZACIÓN INTELIGENTE** (Ya implementado)
- ✅ **Base actual**: Flujo unificado cliente-proyecto-cotización
- ✅ **PDF optimizado**: 2 páginas exactas con footers específicos
- 🔄 **Mejoras a implementar**: Borradores, clonación, drag & drop

### **2. MÓDULO LISTA DE COTIZACIONES** (Existente)
- 🔄 **Mejoras a implementar**: Estados de aprobación, filtros avanzados, acciones masivas

### **3. MÓDULO GESTIÓN DE CLIENTES** (Existente)
- 🔄 **Mejoras a implementar**: Historial de cotizaciones, dashboard de cliente

### **4. MÓDULO GESTIÓN DE PROYECTOS** (Existente)
- 🔄 **Mejoras a implementar**: Timeline de cotizaciones, métricas de proyecto

## 🚀 **ÁREAS DE DESARROLLO PRIORITARIAS**

### **1. GESTIÓN AVANZADA DE COTIZACIONES**

#### **1.1 Sistema de Borradores Mejorado**
**Módulo afectado**: `CotizacionInteligente.jsx`

**Funcionalidades:**
- **Auto-guardado inteligente**: Cada 2 minutos sin saturar BD
- **Versiones de borrador**: Historial con timestamps
- **Recuperación automática**: Restaurar si se pierde conexión
- **Indicador visual**: Estado "Guardado" / "Guardando..." / "Sin guardar"
- **Comparación de versiones**: Ver diferencias entre versiones

**Implementación:**
```javascript
// Nuevo estado para borradores
const [draftVersions, setDraftVersions] = useState([]);
const [lastSaved, setLastSaved] = useState(null);
const [isDirty, setIsDirty] = useState(false);

// Auto-guardado mejorado
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    if (isDirty && !isSaving) {
      saveDraft();
    }
  }, 120000); // 2 minutos

  return () => clearInterval(autoSaveInterval);
}, [isDirty, isSaving]);
```

#### **1.2 Clonación y Duplicación**
**Módulo afectado**: `CotizacionInteligente.jsx` + nueva página `CotizacionClonar.jsx`

**Funcionalidades:**
- **Clonar cotización**: Botón "Clonar" en lista de cotizaciones
- **Duplicar con modificaciones**: Editar campos específicos al clonar
- **Historial de clonación**: Tracking de cotizaciones derivadas
- **Plantillas desde cotización**: Convertir en plantilla reutilizable

**Implementación:**
```javascript
// Función de clonación
const cloneQuotation = async (quotationId) => {
  const original = await getQuotation(quotationId);
  const cloned = {
    ...original,
    id: null,
    status: 'draft',
    created_at: new Date(),
    reference: `${original.reference}-CLON-${Date.now()}`,
    parent_id: quotationId
  };
  return await createQuotation(cloned);
};
```

### **2. SISTEMA DE APROBACIONES Y FLUJOS**

#### **2.1 Flujo de Aprobación con Estados**
**Módulos afectados**: Todos los módulos de cotizaciones

**Estados implementados:**
- **Borrador**: `draft` - En edición
- **Enviada**: `sent` - Enviada al cliente
- **En Revisión**: `pending_approval` - Esperando aprobación
- **Aprobada**: `approved` - Aprobada por supervisor
- **Rechazada**: `rejected` - Rechazada con comentarios
- **Cancelada**: `cancelled` - Cancelada por el usuario

**Implementación:**
```javascript
// Nuevo modelo de estados
const quotationStates = {
  draft: { label: 'Borrador', color: 'gray', icon: 'edit' },
  sent: { label: 'Enviada', color: 'blue', icon: 'send' },
  pending_approval: { label: 'En Revisión', color: 'orange', icon: 'clock' },
  approved: { label: 'Aprobada', color: 'green', icon: 'check' },
  rejected: { label: 'Rechazada', color: 'red', icon: 'x' },
  cancelled: { label: 'Cancelada', color: 'gray', icon: 'ban' }
};
```

#### **2.2 Workflow Automatizado**
**Módulo afectado**: Nuevo `WorkflowManager.jsx`

**Funcionalidades:**
- **Reglas de aprobación**: Automatizar según monto o tipo
- **Escalamiento automático**: Subir a supervisor si excede límite
- **Validaciones automáticas**: Verificar datos antes de enviar
- **Integración con roles**: Diferentes niveles de aprobación

**Implementación:**
```javascript
// Reglas de aprobación automática
const approvalRules = {
  amount_threshold: 50000, // Soles
  auto_approve_under: 10000,
  require_supervisor_over: 50000,
  require_director_over: 100000
};

const checkApprovalRequired = (quotation) => {
  const total = calculateTotal(quotation.items);
  if (total > approvalRules.amount_threshold) {
    return 'pending_approval';
  }
  return 'approved';
};
```

#### **2.3 Notificaciones Inteligentes**
**Módulo afectado**: Nuevo `NotificationSystem.jsx`

**Funcionalidades:**
- **Notificaciones en tiempo real**: WebSocket para cambios de estado
- **Email automático**: Notificaciones por correo
- **SMS opcional**: Para aprobaciones urgentes
- **Dashboard de notificaciones**: Centro de notificaciones

**Implementación:**
```javascript
// Sistema de notificaciones
const NotificationSystem = {
  sendApprovalRequest: (quotation, approver) => {
    // Email + WebSocket + Dashboard
    emailService.send({
      to: approver.email,
      subject: `Cotización ${quotation.id} requiere aprobación`,
      template: 'approval_request'
    });
    
    websocketService.notify(approver.id, {
      type: 'approval_request',
      quotation: quotation
    });
  }
};
```

### **3. MEJORAS DE UX/UI**

#### **3.1 Interfaz Drag & Drop**
**Módulo afectado**: `CotizacionInteligente.jsx`

**Funcionalidades:**
- **Reordenar ítems**: Drag & drop en tabla de ítems
- **Agrupar servicios**: Arrastrar para agrupar
- **Priorizar ítems**: Orden visual de importancia
- **Feedback visual**: Animaciones suaves

**Implementación:**
```javascript
// React DnD para drag & drop
import { DndProvider, useDrag, useDrop } from 'react-dnd';

const DraggableItem = ({ item, index, moveItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <tr ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* Contenido del ítem */}
    </tr>
  );
};
```

#### **3.2 Mobile Responsive**
**Módulos afectados**: Todos los módulos

**Funcionalidades:**
- **Diseño adaptativo**: Breakpoints para móvil/tablet/desktop
- **Touch gestures**: Swipe, pinch, tap
- **Navegación móvil**: Menú hamburguesa optimizado
- **Formularios táctiles**: Inputs optimizados para touch

**Implementación:**
```css
/* Responsive design */
@media (max-width: 768px) {
  .quotation-form {
    padding: 10px;
  }
  
  .items-table {
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
```

#### **3.3 Modo Offline**
**Módulo afectado**: Nuevo `OfflineManager.jsx`

**Funcionalidades:**
- **Cache local**: IndexedDB para datos offline
- **Sincronización**: Auto-sync cuando vuelve conexión
- **Indicador offline**: Visual de estado de conexión
- **Trabajo offline**: Crear/editar sin conexión

**Implementación:**
```javascript
// Service Worker para offline
const OfflineManager = {
  cacheData: (key, data) => {
    localStorage.setItem(`offline_${key}`, JSON.stringify(data));
  },
  
  syncWhenOnline: async () => {
    if (navigator.onLine) {
      const pendingChanges = await getPendingChanges();
      for (const change of pendingChanges) {
        await syncChange(change);
      }
    }
  }
};
```

### **4. SEGURIDAD Y COMPLIANCE**

#### **4.1 Seguridad Avanzada**
**Módulos afectados**: Todos los módulos

**Funcionalidades:**
- **Autenticación 2FA**: Two-factor authentication
- **Sesiones seguras**: JWT con refresh tokens
- **Encriptación**: Datos sensibles encriptados
- **Rate limiting**: Protección contra ataques

**Implementación:**
```javascript
// Middleware de seguridad
const securityMiddleware = {
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de requests
  }),
  
  encryptSensitiveData: (data) => {
    return crypto.encrypt(data, process.env.ENCRYPTION_KEY);
  },
  
  auditLog: (action, user, details) => {
    auditService.log({
      action,
      user_id: user.id,
      timestamp: new Date(),
      details
    });
  }
};
```

#### **4.2 Auditoría Completa**
**Módulo afectado**: Nuevo `AuditLogger.jsx`

**Funcionalidades:**
- **Log de acciones**: Todas las acciones del usuario
- **Trail de cambios**: Historial completo de modificaciones
- **Reportes de auditoría**: Exportar logs para compliance
- **Alertas de seguridad**: Detectar actividades sospechosas

**Implementación:**
```javascript
// Sistema de auditoría
const AuditLogger = {
  logAction: (action, user, resource, details) => {
    const auditEntry = {
      id: generateId(),
      action,
      user_id: user.id,
      user_email: user.email,
      resource_type: resource.type,
      resource_id: resource.id,
      timestamp: new Date(),
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      details
    };
    
    auditDatabase.insert(auditEntry);
  }
};
```

#### **4.3 Cumplimiento Legal**
**Módulos afectados**: Todos los módulos

**Funcionalidades:**
- **Políticas de privacidad**: Gestión de versiones
- **Consentimiento**: Checkboxes de aceptación
- **Retención de datos**: Eliminación automática
- **GDPR compliance**: Derecho al olvido

**Implementación:**
```javascript
// Compliance manager
const ComplianceManager = {
  checkDataRetention: () => {
    const oldData = getDataOlderThan(7 * 365 * 24 * 60 * 60 * 1000); // 7 años
    return oldData.map(record => ({
      id: record.id,
      type: record.type,
      created_at: record.created_at,
      shouldDelete: true
    }));
  },
  
  handleDataDeletion: (recordId) => {
    // Soft delete para mantener auditoría
    softDelete(recordId);
    auditLogger.log('data_deletion', user, { recordId });
  }
};
```

## 📊 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Sprint 1 (2 semanas): Borradores y Clonación**
- ✅ Sistema de borradores mejorado
- ✅ Funcionalidad de clonación
- ✅ Historial de versiones

### **Sprint 2 (2 semanas): Aprobaciones y Workflow**
- ✅ Estados de cotización
- ✅ Workflow automatizado
- ✅ Notificaciones básicas

### **Sprint 3 (2 semanas): UX/UI Avanzada**
- ✅ Drag & drop para ítems
- ✅ Mobile responsive
- ✅ Modo offline básico

### **Sprint 4 (2 semanas): Seguridad y Compliance**
- ✅ Auditoría completa
- ✅ Seguridad avanzada
- ✅ Cumplimiento legal

## 🎯 **RESULTADO ESPERADO**

Al finalizar estas mejoras, tendremos:

- ✅ **Borradores inteligentes** con versionado y recuperación
- ✅ **Clonación eficiente** de cotizaciones
- ✅ **Flujo de aprobación** automatizado y notificaciones
- ✅ **Interfaz moderna** con drag & drop y mobile
- ✅ **Seguridad robusta** con auditoría completa
- ✅ **Cumplimiento legal** para operaciones empresariales

## 📅 **Fecha de inicio**
2025-01-20

## 👤 **Planificado por**
Asistente IA - Plan Fase 2 Mejorado
