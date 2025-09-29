# IMPLEMENTACIÓN FASE 2 DETALLADA - SISTEMA DE APROBACIONES Y MÉTRICAS

## 🎯 **OBJETIVO ESPECÍFICO**

Implementar sistema de aprobaciones con roles específicos y métricas de categorías para jefe comercial, con funcionalidades de borradores, clonación, y mejoras de UX/UI.

## 📋 **MÓDULOS A DESARROLLAR**

### **1. SISTEMA DE APROBACIONES CON ROLES**

#### **1.1 Roles de Aprobación**
```javascript
const approvalRoles = {
  facturacion: {
    name: 'Facturación',
    level: 1,
    canApprove: ['draft', 'sent'],
    maxAmount: 10000, // Soles
    required: true
  },
  jefe_comercial: {
    name: 'Jefe Comercial',
    level: 2,
    canApprove: ['pending_approval', 'sent'],
    maxAmount: 50000, // Soles
    required: true,
    canViewMetrics: true
  },
  director: {
    name: 'Director',
    level: 3,
    canApprove: ['pending_approval', 'sent'],
    maxAmount: 999999, // Soles
    required: false
  }
};
```

#### **1.2 Flujo de Aprobación**
```javascript
const approvalFlow = {
  draft: {
    next: 'sent',
    requires: ['facturacion'],
    autoApprove: false
  },
  sent: {
    next: 'pending_approval',
    requires: ['jefe_comercial'],
    autoApprove: false
  },
  pending_approval: {
    next: 'approved',
    requires: ['jefe_comercial'],
    autoApprove: false
  },
  approved: {
    next: 'completed',
    requires: [],
    autoApprove: true
  }
};
```

### **2. MÉTRICAS DE CATEGORÍAS**

#### **2.1 Categorías de Laboratorio**
```javascript
const labCategories = {
  suelo: {
    name: 'Análisis de Suelo',
    subcategories: [
      'Granulometría',
      'Límites de Atterberg',
      'Densidad',
      'Humedad',
      'Permeabilidad'
    ]
  },
  agregado: {
    name: 'Análisis de Agregados',
    subcategories: [
      'Granulometría',
      'Absorción',
      'Densidad',
      'Resistencia',
      'Desgaste'
    ]
  },
  especializado: {
    name: 'Análisis Especializados',
    subcategories: [
      'Química',
      'Física',
      'Mecánica',
      'Ambiental',
      'Geotécnico'
    ]
  }
};
```

#### **2.2 Categorías de Ingeniería**
```javascript
const engineeringCategories = {
  diseno: {
    name: 'Diseño',
    subcategories: [
      'Estructural',
      'Geotécnico',
      'Hidráulico',
      'Vial',
      'Arquitectónico'
    ]
  },
  consultoria: {
    name: 'Consultoría',
    subcategories: [
      'Técnica',
      'Legal',
      'Ambiental',
      'Económica',
      'Social'
    ]
  },
  supervision: {
    name: 'Supervisión',
    subcategories: [
      'Obra',
      'Calidad',
      'Seguridad',
      'Ambiental',
      'Técnica'
    ]
  }
};
```

### **3. DASHBOARD DE MÉTRICAS PARA JEFE COMERCIAL**

#### **3.1 Métricas Mensuales**
```javascript
const monthlyMetrics = {
  totalQuotations: 0,
  totalAmount: 0,
  labCategories: {
    suelo: { count: 0, amount: 0 },
    agregado: { count: 0, amount: 0 },
    especializado: { count: 0, amount: 0 }
  },
  engineeringCategories: {
    diseno: { count: 0, amount: 0 },
    consultoria: { count: 0, amount: 0 },
    supervision: { count: 0, amount: 0 }
  },
  topServices: [],
  conversionRate: 0,
  averageApprovalTime: 0
};
```

#### **3.2 Componente Dashboard**
```jsx
const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(monthlyMetrics);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  useEffect(() => {
    fetchMonthlyMetrics(selectedMonth);
  }, [selectedMonth]);
  
  return (
    <div className="metrics-dashboard">
      <div className="metrics-header">
        <h2>Métricas Mensuales - {formatMonth(selectedMonth)}</h2>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </div>
      
      <div className="metrics-grid">
        <MetricCard 
          title="Total Cotizaciones" 
          value={metrics.totalQuotations}
          icon="📊"
        />
        <MetricCard 
          title="Monto Total" 
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
        <LabCategoriesChart data={metrics.labCategories} />
        <EngineeringCategoriesChart data={metrics.engineeringCategories} />
      </div>
    </div>
  );
};
```

### **4. SISTEMA DE BORRADORES MEJORADO**

#### **4.1 Auto-guardado Inteligente**
```javascript
const useAutoSave = (quotationData, isDirty) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!isDirty || isSaving) return;
    
    const autoSaveInterval = setInterval(async () => {
      try {
        setIsSaving(true);
        const result = await saveDraft(quotationData);
        setLastSaved(new Date());
        console.log('Borrador guardado automáticamente');
      } catch (error) {
        console.error('Error al guardar borrador:', error);
      } finally {
        setIsSaving(false);
      }
    }, 120000); // 2 minutos
    
    return () => clearInterval(autoSaveInterval);
  }, [quotationData, isDirty, isSaving]);
  
  return { lastSaved, isSaving };
};
```

#### **4.2 Versiones de Borrador**
```javascript
const useDraftVersions = (quotationId) => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  
  const saveVersion = async (data) => {
    const version = {
      id: generateId(),
      timestamp: new Date(),
      data: { ...data },
      changes: calculateChanges(versions[0]?.data, data)
    };
    
    setVersions(prev => [version, ...prev]);
    await saveDraftVersion(quotationId, version);
  };
  
  const restoreVersion = (versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersion(version);
      return version.data;
    }
  };
  
  return { versions, currentVersion, saveVersion, restoreVersion };
};
```

### **5. FUNCIONALIDAD DE CLONACIÓN**

#### **5.1 Clonación Inteligente**
```javascript
const useQuotationCloning = () => {
  const cloneQuotation = async (originalId) => {
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
        }))
      };
      
      const newQuotation = await createQuotation(cloned);
      await logCloningAction(originalId, newQuotation.id);
      
      return newQuotation;
    } catch (error) {
      console.error('Error al clonar cotización:', error);
      throw error;
    }
  };
  
  const duplicateWithModifications = async (originalId, modifications) => {
    const cloned = await cloneQuotation(originalId);
    const modified = { ...cloned, ...modifications };
    return await updateQuotation(modified.id, modified);
  };
  
  return { cloneQuotation, duplicateWithModifications };
};
```

### **6. NOTIFICACIONES INTELIGENTES**

#### **6.1 Sistema de Notificaciones**
```javascript
const NotificationSystem = {
  sendApprovalRequest: async (quotation, approver) => {
    const notification = {
      type: 'approval_request',
      quotation_id: quotation.id,
      approver_id: approver.id,
      message: `Cotización ${quotation.id} requiere aprobación`,
      priority: 'high',
      actions: ['approve', 'reject', 'request_changes']
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
      priority: 'medium'
    };
    
    await websocketService.notify(quotation.created_by, notification);
    await notificationService.create(notification);
  }
};
```

### **7. MOBILE RESPONSIVE**

#### **7.1 Diseño Adaptativo**
```css
/* Responsive design para cotizaciones */
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

### **8. SEGURIDAD Y AUDITORÍA**

#### **8.1 Sistema de Auditoría**
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
  },
  
  getAuditTrail: (resourceId, resourceType) => {
    return auditDatabase.find({
      resource_id: resourceId,
      resource_type: resourceType
    }).sort({ timestamp: -1 });
  }
};
```

#### **8.2 Seguridad Avanzada**
```javascript
const SecurityManager = {
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes, intenta más tarde'
  }),
  
  encryptSensitiveData: (data) => {
    return crypto.encrypt(data, process.env.ENCRYPTION_KEY);
  },
  
  validateApprovalPermissions: (user, quotation) => {
    const userRole = approvalRoles[user.role];
    if (!userRole) return false;
    
    return userRole.canApprove.includes(quotation.status) &&
           quotation.amount <= userRole.maxAmount;
  }
};
```

## 📊 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Sprint 1 (2 semanas): Borradores y Clonación**
- ✅ Sistema de borradores con auto-guardado
- ✅ Versiones de borrador y recuperación
- ✅ Funcionalidad de clonación
- ✅ Historial de clonación

### **Sprint 2 (2 semanas): Aprobaciones y Métricas**
- ✅ Sistema de roles de aprobación
- ✅ Flujo de aprobación automatizado
- ✅ Dashboard de métricas para jefe comercial
- ✅ Categorías de laboratorio e ingeniería

### **Sprint 3 (2 semanas): Notificaciones y UX**
- ✅ Sistema de notificaciones inteligentes
- ✅ Mobile responsive
- ✅ Interfaz mejorada

### **Sprint 4 (2 semanas): Seguridad y Compliance**
- ✅ Auditoría completa
- ✅ Seguridad avanzada
- ✅ Cumplimiento legal

## 🎯 **RESULTADO ESPERADO**

Al finalizar la implementación:

- ✅ **Sistema de aprobaciones** con roles específicos (facturación, jefe comercial)
- ✅ **Métricas completas** de categorías de laboratorio e ingeniería
- ✅ **Dashboard mensual** para jefe comercial con totales y análisis
- ✅ **Borradores inteligentes** con versionado y recuperación
- ✅ **Clonación eficiente** de cotizaciones
- ✅ **Notificaciones en tiempo real** para aprobaciones
- ✅ **Interfaz mobile** optimizada
- ✅ **Seguridad robusta** con auditoría completa

## 📅 **Fecha de inicio**
2025-01-20

## 👤 **Planificado por**
Asistente IA - Implementación Fase 2 Detallada
