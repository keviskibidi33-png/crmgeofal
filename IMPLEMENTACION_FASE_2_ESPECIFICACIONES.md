# IMPLEMENTACIÓN FASE 2 – ESPECIFICACIONES DETALLADAS

## 🎯 **OBJETIVO**
Construir un sistema de cotizaciones y aprobaciones con control diferenciado de roles, métricas de tipo embudo basadas en aprobaciones reales, y un entorno seguro y usable en todos los dispositivos.

## 📋 **SISTEMA DE APROBACIONES CON ROLES (FLUJO AISLADO)**

### **1. ROL: FACTURACIÓN**
**Funcionalidades:**
- ✅ **Recibe solicitudes de aprobación** creadas por el vendedor
- ✅ **Registra información del cliente**, monto total y servicios pagados
- ✅ **Aprueba o rechaza cotizaciones** de forma individual
- ✅ **Vistas y registros exclusivos** para este rol
- ✅ **Aislamiento total** respecto a otros roles

**Estados que maneja:**
- `sent` → `pending_approval` (Recibe de vendedor)
- `pending_approval` → `approved` (Aprueba)
- `pending_approval` → `rejected` (Rechaza)

**Interfaz específica:**
```jsx
const FacturacionDashboard = () => {
  return (
    <div className="facturacion-dashboard">
      <h2>Panel de Facturación</h2>
      <div className="pending-approvals">
        <h3>Cotizaciones Pendientes de Aprobación</h3>
        <QuotationList 
          status="pending_approval"
          showActions={true}
          actions={['approve', 'reject', 'request_changes']}
        />
      </div>
      <div className="approval-history">
        <h3>Historial de Aprobaciones</h3>
        <QuotationList 
          status={['approved', 'rejected']}
          showActions={false}
        />
      </div>
    </div>
  );
};
```

### **2. ROL: JEFE COMERCIAL**
**Funcionalidades:**
- ✅ **Accede únicamente a reportes y dashboards** basados en cotizaciones aprobadas por facturación
- ✅ **No tiene visibilidad** de las solicitudes en trámite ni de estados previos
- ✅ **Aislamiento total** respecto a facturación
- ✅ **Métricas construidas solo** desde información ya validada por facturación

**Estados que puede ver:**
- Solo `approved` (Cotizaciones ya aprobadas por facturación)

**Interfaz específica:**
```jsx
const JefeComercialDashboard = () => {
  return (
    <div className="jefe-comercial-dashboard">
      <h2>Panel de Jefe Comercial</h2>
      <div className="metrics-section">
        <h3>Métricas de Servicios Aprobados</h3>
        <MetricsGrid data={approvedQuotations} />
      </div>
      <div className="analytics-section">
        <h3>Análisis Embudo de Servicios</h3>
        <FunnelChart data={serviceFunnel} />
      </div>
    </div>
  );
};
```

## 📊 **MÉTRICAS PARA JEFE COMERCIAL (EMBUDO DE SERVICIOS)**

### **1. Visión de Totales por Categoría**
```javascript
const categoryMetrics = {
  laboratorio: {
    name: 'Laboratorio',
    source: 'módulo de Servicios',
    totalAmount: 0,
    totalQuotations: 0,
    services: []
  },
  ingenieria: {
    name: 'Ingeniería',
    source: 'módulo de Ingeniería',
    totalAmount: 0,
    totalQuotations: 0,
    services: []
  }
};
```

### **2. Reporte de Servicios Aprobados**
```javascript
const approvedServicesReport = {
  monthly: {
    totalQuotations: 0,
    totalAmount: 0,
    averageAmount: 0,
    topServices: [],
    conversionRate: 0
  },
  byCategory: {
    laboratorio: {
      totalAmount: 0,
      totalQuotations: 0,
      services: []
    },
    ingenieria: {
      totalAmount: 0,
      totalQuotations: 0,
      services: []
    }
  }
};
```

### **3. Desglose Embudo Analítico**
```javascript
const funnelAnalytics = {
  services: [
    {
      name: 'Ensayo Estándar',
      totalQuotations: 0,
      totalAmount: 0,
      conversionRate: 0,
      rank: 1
    },
    {
      name: 'Ensayo Especial',
      totalQuotations: 0,
      totalAmount: 0,
      conversionRate: 0,
      rank: 2
    },
    {
      name: 'Ensayo de Campo',
      totalQuotations: 0,
      totalAmount: 0,
      conversionRate: 0,
      rank: 3
    }
  ],
  distribution: {
    mostUsed: [],
    leastUsed: [],
    businessImpact: [],
    requiresFollowUp: []
  }
};
```

## ⚙️ **FUNCIONALIDADES DETALLADAS**

### **1. GESTIÓN AVANZADA DE COTIZACIONES**

#### **1.1 Borradores Mejorados**
```javascript
const useDraftManagement = () => {
  const [draftVersions, setDraftVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  
  const saveDraftVersion = async (quotationData) => {
    const version = {
      id: generateId(),
      timestamp: new Date(),
      data: { ...quotationData },
      changes: calculateChanges(currentVersion?.data, quotationData)
    };
    
    setDraftVersions(prev => [version, ...prev]);
    await saveDraftVersionToDB(quotationData.id, version);
  };
  
  const restoreDraftVersion = (versionId) => {
    const version = draftVersions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersion(version);
      return version.data;
    }
  };
  
  return { draftVersions, currentVersion, saveDraftVersion, restoreDraftVersion };
};
```

#### **1.2 Clonación Inteligente**
```javascript
const useQuotationCloning = () => {
  const cloneQuotation = async (originalId, modifications = {}) => {
    try {
      const original = await getQuotation(originalId);
      const cloned = {
        ...original,
        id: null,
        status: 'draft',
        created_at: new Date(),
        reference: `${original.reference}-CLON-${Date.now()}`,
        parent_id: originalId,
        items: original.items.map(item => ({
          ...item,
          id: generateId()
        })),
        ...modifications
      };
      
      const newQuotation = await createQuotation(cloned);
      await logCloningAction(originalId, newQuotation.id);
      
      return newQuotation;
    } catch (error) {
      console.error('Error al clonar cotización:', error);
      throw error;
    }
  };
  
  return { cloneQuotation };
};
```

### **2. SISTEMA DE APROBACIONES Y FLUJOS**

#### **2.1 Estados Definidos**
```javascript
const quotationStates = {
  draft: {
    label: 'Borrador',
    color: 'gray',
    icon: 'edit',
    canEdit: true,
    canDelete: true
  },
  sent: {
    label: 'Enviada',
    color: 'blue',
    icon: 'send',
    canEdit: false,
    canDelete: false
  },
  pending_approval: {
    label: 'En Revisión',
    color: 'orange',
    icon: 'clock',
    canEdit: false,
    canDelete: false
  },
  approved: {
    label: 'Aprobada',
    color: 'green',
    icon: 'check',
    canEdit: false,
    canDelete: false
  },
  rejected: {
    label: 'Rechazada',
    color: 'red',
    icon: 'x',
    canEdit: true,
    canDelete: true
  }
};
```

#### **2.2 Roles Diferenciados y Aislados**
```javascript
const rolePermissions = {
  facturacion: {
    name: 'Facturación',
    canView: ['sent', 'pending_approval', 'approved', 'rejected'],
    canApprove: ['pending_approval'],
    canReject: ['pending_approval'],
    canEdit: ['rejected'],
    canDelete: ['rejected'],
    isolationLevel: 'high'
  },
  jefe_comercial: {
    name: 'Jefe Comercial',
    canView: ['approved'],
    canApprove: [],
    canReject: [],
    canEdit: [],
    canDelete: [],
    isolationLevel: 'total',
    canViewMetrics: true
  },
  vendedor: {
    name: 'Vendedor',
    canView: ['draft', 'sent', 'pending_approval', 'approved', 'rejected'],
    canApprove: [],
    canReject: [],
    canEdit: ['draft', 'rejected'],
    canDelete: ['draft', 'rejected'],
    isolationLevel: 'none'
  }
};
```

#### **2.3 Notificaciones Multicanal**
```javascript
const NotificationSystem = {
  sendApprovalRequest: async (quotation, approver) => {
    const notification = {
      type: 'approval_request',
      quotation_id: quotation.id,
      approver_id: approver.id,
      message: `Cotización ${quotation.id} requiere aprobación`,
      priority: 'high',
      channels: ['email', 'websocket', 'dashboard']
    };
    
    // Email
    await emailService.send({
      to: approver.email,
      subject: `Aprobación requerida - Cotización ${quotation.id}`,
      template: 'approval_request',
      data: { quotation, approver }
    });
    
    // WebSocket
    await websocketService.notify(approver.id, notification);
    
    // Dashboard
    await notificationService.create(notification);
  },
  
  sendApprovalResult: async (quotation, result, approver) => {
    const notification = {
      type: 'approval_result',
      quotation_id: quotation.id,
      result,
      approver_id: approver.id,
      message: `Cotización ${quotation.id} ${result === 'approved' ? 'aprobada' : 'rechazada'}`,
      priority: 'medium',
      channels: ['email', 'websocket', 'dashboard']
    };
    
    await websocketService.notify(quotation.created_by, notification);
    await notificationService.create(notification);
  }
};
```

### **3. MEJORAS DE UX/UI**

#### **3.1 Responsive Full**
```css
/* Mobile First Design */
@media (max-width: 768px) {
  .quotation-form {
    padding: 10px;
    margin: 0;
  }
  
  .quotation-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .items-table {
    overflow-x: auto;
    font-size: 14px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
    position: sticky;
    bottom: 0;
    background: white;
    padding: 10px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  .metrics-dashboard {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .approval-flow {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .quotation-form {
    padding: 5px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
```

#### **3.2 Interfaz Optimizada**
```jsx
const ResponsiveQuotationForm = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`quotation-form ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="form-header">
        <h2>Cotización Inteligente</h2>
        {isMobile && <MobileMenu />}
      </div>
      
      <div className="form-content">
        <ClientSection />
        <ProjectSection />
        <QuotationSection />
        <ItemsSection />
      </div>
      
      <div className="form-actions">
        <ActionButtons isMobile={isMobile} />
      </div>
    </div>
  );
};
```

## 🔒 **SEGURIDAD Y AISLAMIENTO**

### **1. Control de Acceso por Roles**
```javascript
const RoleBasedAccess = {
  checkPermission: (user, action, resource) => {
    const userRole = rolePermissions[user.role];
    if (!userRole) return false;
    
    return userRole.canView.includes(resource.status) &&
           userRole[action]?.includes(resource.status);
  },
  
  filterDataByRole: (user, data) => {
    const userRole = rolePermissions[user.role];
    if (!userRole) return [];
    
    return data.filter(item => 
      userRole.canView.includes(item.status)
    );
  }
};
```

### **2. Auditoría de Acciones**
```javascript
const AuditLogger = {
  logAction: (action, user, resource, details) => {
    const auditEntry = {
      id: generateId(),
      action,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      resource_type: resource.type,
      resource_id: resource.id,
      timestamp: new Date(),
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      details: JSON.stringify(details)
    };
    
    auditDatabase.insert(auditEntry);
  }
};
```

## 📊 **DASHBOARD DE MÉTRICAS**

### **1. Métricas para Jefe Comercial**
```jsx
const JefeComercialMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalQuotations: 0,
    totalAmount: 0,
    byCategory: {
      laboratorio: { amount: 0, count: 0 },
      ingenieria: { amount: 0, count: 0 }
    },
    topServices: [],
    conversionRate: 0
  });
  
  return (
    <div className="metrics-dashboard">
      <div className="metrics-header">
        <h2>Métricas de Servicios Aprobados</h2>
        <MonthSelector />
      </div>
      
      <div className="metrics-grid">
        <MetricCard 
          title="Total Cotizaciones Aprobadas" 
          value={metrics.totalQuotations}
          icon="📊"
        />
        <MetricCard 
          title="Monto Total Aprobado" 
          value={`S/ ${formatCurrency(metrics.totalAmount)}`}
          icon="💰"
        />
        <MetricCard 
          title="Tasa de Conversión" 
          value={`${metrics.conversionRate}%`}
          icon="📈"
        />
      </div>
      
      <div className="categories-section">
        <CategoryChart 
          title="Laboratorio" 
          data={metrics.byCategory.laboratorio} 
        />
        <CategoryChart 
          title="Ingeniería" 
          data={metrics.byCategory.ingenieria} 
        />
      </div>
      
      <div className="funnel-section">
        <FunnelChart 
          title="Embudo de Servicios" 
          data={metrics.topServices} 
        />
      </div>
    </div>
  );
};
```

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Sprint 1 (2 semanas): Sistema de Aprobaciones**
- ✅ Roles diferenciados (Facturación, Jefe Comercial)
- ✅ Estados de cotización
- ✅ Flujo de aprobación
- ✅ Aislamiento de datos por rol

### **Sprint 2 (2 semanas): Métricas y Dashboard**
- ✅ Dashboard para Jefe Comercial
- ✅ Métricas de embudo de servicios
- ✅ Reportes por categoría
- ✅ Análisis de conversión

### **Sprint 3 (2 semanas): Borradores y Clonación**
- ✅ Sistema de borradores mejorado
- ✅ Clonación inteligente
- ✅ Historial de versiones
- ✅ Recuperación de borradores

### **Sprint 4 (2 semanas): UX/UI y Seguridad**
- ✅ Responsive design completo
- ✅ Interfaz optimizada
- ✅ Seguridad avanzada
- ✅ Auditoría completa

## 🎯 **RESULTADO ESPERADO**

Al finalizar la implementación:

- ✅ **Sistema de aprobaciones** con roles completamente aislados
- ✅ **Métricas de embudo** para Jefe Comercial basadas en aprobaciones reales
- ✅ **Dashboard analítico** con totales por categoría y servicio
- ✅ **Borradores inteligentes** con versionado y recuperación
- ✅ **Clonación eficiente** de cotizaciones
- ✅ **Interfaz responsive** optimizada para todos los dispositivos
- ✅ **Seguridad robusta** con auditoría completa

## 📅 **Fecha de inicio**
2025-01-20

## 👤 **Planificado por**
Asistente IA - Especificaciones Fase 2
