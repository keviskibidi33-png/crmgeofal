# 🚀 Flujo Ajustado del Sistema CRM GEOFAL

## 🎯 **Flujo Específico por Rol**

### **🔄 Flujo Automático por Estado:**

```
🟡 BORRADOR → Solo "Mis Cotizaciones" (privado)
🟢 APROBADA → "Mis Cotizaciones" + "Proyectos Activos" (compartido)  
🔵 FACTURADA → "Proyectos Activos" + "Archivo" (histórico)
```

## 📋 **Flujo Completo del Sistema**

### **1. VENDEDOR (Creación y Aprobación)**
```
PASO 1: Crear Cotización Inteligente
├── Llenar datos del cliente
├── Definir proyecto
├── Agregar servicios y precios
└── Estado: BORRADOR (solo él lo ve)

PASO 2: Aprobar Cotización
├── Revisar detalles
├── Hacer clic en "Crear y Aprobar"
├── Estado: APROBADA (todos lo ven)
└── Proyecto se crea automáticamente

PASO 3: Enviar a Facturación
├── Cotización aparece en "Proyectos Activos"
├── Facturación la ve automáticamente
└── Lista para facturar
```

### **2. FACTURACIÓN (Facturación y Completado)**
```
PASO 1: Ver Cotización Aprobada
├── Aparece en "Proyectos Activos"
├── Ve detalles del proyecto
└── Puede generar factura

PASO 2: Adjuntar Factura
├── Genera factura
├── Adjunta archivo de factura
├── Marca cotización como FACTURADA
├── Estado: FACTURADA (completado)
└── Proyecto se archiva automáticamente

PASO 3: Proyecto Completado
├── Se mantiene en "Proyectos Activos"
├── Se archiva en "Proyectos Completados"
└── Historial completo disponible
```

### **3. LABORATORIO (Trabajo en Proyectos)**
```
PASO 1: Ver Proyectos Asignados
├── Solo ve proyectos con cotizaciones aprobadas
├── No ve borradores (evita trabajo perdido)
└── Puede planificar servicios

PASO 2: Realizar Servicios
├── Ve detalles del proyecto
├── Realiza los servicios cotizados
├── Sube evidencias
└── Proyecto compartido con el vendedor

PASO 3: Proyecto Completado
├── Proyecto se marca como completado
├── Se archiva automáticamente
└── Historial disponible
```

### **4. JEFA COMERCIAL (Supervisión)**
```
PASO 1: Ver Métricas
├── Dashboard de "Métricas de Embudo"
├── Ve rendimiento del equipo
└── Analiza conversiones

PASO 2: Supervisar Proyectos
├── Ve "Proyectos Activos"
├── Supervisa sin intervenir
└── Recibe notificaciones automáticas

PASO 3: Análisis de Rendimiento
├── Ve métricas por vendedor
├── Analiza conversiones
└── Toma decisiones basadas en datos
```

## 🔧 **Implementación del Flujo Ajustado**

### **Backend:**
- ✅ **Estados automáticos:** BORRADOR → APROBADA → FACTURADA
- ✅ **Notificaciones automáticas:** En cada cambio de estado
- ✅ **Proyectos automáticos:** Se crean al aprobar cotización
- ✅ **Archivo automático:** Se archiva al facturar

### **Frontend:**
- ✅ **"Mis Cotizaciones":** Solo cotizaciones del vendedor
- ✅ **"Proyectos Activos":** Solo cotizaciones aprobadas
- ✅ **"Proyectos Completados":** Solo cotizaciones facturadas
- ✅ **"Proyectos Laboratorio":** Solo proyectos asignados a laboratorio
- ✅ **"Facturación Proyectos":** Solo proyectos listos para facturar
- ✅ **Notificaciones:** Alertas automáticas

## 🎯 **Puntos Clave del Flujo Ajustado**

### **1. FACTURACIÓN - Adjuntar Facturas**
- ✅ **Ver cotizaciones aprobadas** en "Proyectos Activos"
- ✅ **Generar factura** y adjuntarla al proyecto
- ✅ **Marcar como FACTURADA** cuando se adjunta la factura
- ✅ **Proyecto se completa** automáticamente

### **2. 🧪 LABORATORIO - Proyectos Asignados**
- ✅ **Ver proyectos asignados** (cotizaciones aprobadas)
- ✅ **Trabajar en servicios** del proyecto
- ✅ **Subir evidencias** y resultados
- ✅ **Proyecto compartido** con el vendedor que lo creó

### **3. 🔔 Notificaciones Automáticas**
- ✅ **BORRADOR:** ❌ No hay notificaciones (es privado)
- ✅ **APROBADA:** Jefa Comercial, Facturación, Laboratorio
- ✅ **FACTURADA:** Vendedor, Jefa Comercial, Laboratorio

## 🚀 **Beneficios del Flujo Ajustado**

### **Para Vendedores:**
1. **Privacidad:** Borradores solo para ellos
2. **Control:** Deciden cuándo compartir
3. **Autonomía:** Aproban sin depender de jefes
4. **Visibilidad:** Ven todo su trabajo

### **Para Facturación:**
1. **Eficiencia:** Solo ve cotizaciones aprobadas
2. **Claridad:** No ve borradores confusos
3. **Proceso directo:** Aprobada → Facturada
4. **Adjuntar facturas:** Sistema completo de facturación

### **Para Laboratorio:**
1. **Proyectos reales:** Solo cotizaciones aprobadas
2. **Sin trabajo perdido:** No ve borradores cancelados
3. **Eficiencia:** Trabaja en proyectos confirmados
4. **Compartido con vendedor:** Colaboración directa

### **Para Jefa Comercial:**
1. **Supervisión:** Ve métricas sin intervenir
2. **Análisis:** Dashboard completo del equipo
3. **Notificaciones:** Se entera de todo
4. **Decisiones:** Datos en tiempo real

## 📊 **Flujo Visual del Sistema Ajustado**

```
VENDEDOR:
[Crear] → [Borrador] → [Aprobar] → [Aprobada] → [Enviar a Facturación]

FACTURACIÓN:
[Ver Aprobada] → [Generar Factura] → [Adjuntar Factura] → [Marcar Facturada] → [Completado]

LABORATORIO:
[Ver Proyecto] → [Realizar Servicios] → [Subir Evidencias] → [Completado]

JEFA COMERCIAL:
[Ver Métricas] → [Supervisar] → [Analizar] → [Tomar Decisiones]
```

## 🎉 **Conclusión**

**El flujo ajustado es perfecto porque:**

1. **Automático:** El sistema decide dónde mostrar cada cotización
2. **Lógico:** Borradores privados, aprobadas compartidas, facturadas archivadas
3. **Eficiente:** Cada rol ve solo lo que necesita
4. **Profesional:** Interfaz clara y organizada
5. **Específico:** Facturación adjunta facturas, Laboratorio trabaja en proyectos
6. **Escalable:** Funciona con cualquier cantidad de usuarios

**¡El sistema está listo para usar y es mucho más profesional y específico!** 🚀
