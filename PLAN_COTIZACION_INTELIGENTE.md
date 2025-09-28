
# 📋 PLAN: MÓDULO "COTIZACIÓN INTELIGENTE"

## 🎯 **OBJETIVO**
Simplificar el flujo de creación de cotizaciones para usuarios no técnicos, combinando formulario unificado con asistente visual.

## 🔄 **FLUJO ACTUAL vs NUEVO**

### **FLUJO ACTUAL (Complejo)**
```
1. Crear Cliente → 2. Crear Proyecto → 3. Crear Cotización
```
**Problemas:**
- ❌ Demasiados pasos
- ❌ Interfaz confusa
- ❌ Riesgo de perder datos
- ❌ No intuitivo para usuarios no técnicos

### **FLUJO NUEVO (Simplificado)**
```
📝 "Cotización Inteligente" → Todo en un formulario unificado
```
**Ventajas:**
- ✅ Un solo formulario
- ✅ Auto-guardado automático
- ✅ Interfaz visual e intuitiva
- ✅ Creación automática de cliente/proyecto

## 🏗️ **ARQUITECTURA DE MÓDULOS**

### **📋 MÓDULO PRINCIPAL: "Cotización Inteligente"**
- **Ubicación**: Página principal del sistema
- **Función**: Crear/editar/clonar cotizaciones
- **Características**:
  - Formulario unificado con iconos grandes (🏢📁📋)
  - Auto-guardado automático cada 30 segundos
  - Botón verde grande "💾 GUARDAR"
  - Confirmación visual "✅ Guardado automáticamente"
  - Autocompletado inteligente

### **📊 MÓDULOS SECUNDARIOS: "Gestión y Mapeo"**
1. **👥 Lista de Clientes** - Ver todos los clientes
2. **📁 Lista de Proyectos** - Ver todos los proyectos  
3. **📋 Lista de Cotizaciones** - Ver todas las cotizaciones
4. **🗺️ Mapeo de Relaciones** - Cliente → Proyectos → Cotizaciones

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Módulo "Cotización Inteligente"**
**Objetivo**: Crear el formulario unificado principal

**Características a implementar:**
- ✅ **Formulario unificado** con 3 secciones:
  - 🏢 **CLIENTE**: Nombre, RUC, Teléfono, Email
  - 📁 **PROYECTO**: Nombre, Ubicación
  - 📋 **COTIZACIÓN**: Variante, Ítems, Condiciones

- ✅ **Auto-guardado automático**:
  - Cada 30 segundos
  - Sin interrumpir al usuario
  - Confirmación visual discreta

- ✅ **Interfaz visual**:
  - Iconos grandes (🏢📁📋)
  - Botón verde prominente "💾 GUARDAR"
  - Validación visual en tiempo real
  - Progreso claro: "Paso 1 de 3 ✅"

- ✅ **Autocompletado inteligente**:
  - Si el cliente existe, se autocompleta
  - Sugerencias de clientes similares
  - Creación automática si no existe

### **FASE 2: Módulos de Listas**
**Objetivo**: Crear módulos de gestión y mapeo

**Módulos a implementar:**
- ✅ **Lista de Clientes**:
  - Búsqueda y filtros
  - Botones "✏️ Editar" y "📋 Ver Cotizaciones"
  - Vista de proyectos por cliente

- ✅ **Lista de Proyectos**:
  - Agrupados por cliente
  - Botones "✏️ Editar" y "📋 Ver Cotizaciones"
  - Filtros por estado

- ✅ **Lista de Cotizaciones**:
  - Filtros por cliente, proyecto, fecha
  - Botones "📋 Clonar", "✏️ Editar", "📄 PDF"
  - Estados: Borrador, Enviada, Aprobada

### **FASE 3: Mapeo y Relaciones**
**Objetivo**: Vista de árbol y navegación intuitiva

**Características:**
- ✅ **Vista de árbol**: Cliente → Proyectos → Cotizaciones
- ✅ **Navegación intuitiva** entre módulos
- ✅ **Breadcrumbs** para orientación
- ✅ **Búsqueda global** en todos los módulos

## 🎨 **DISEÑO DE INTERFAZ**

### **Formulario "Cotización Inteligente"**
```
┌─────────────────────────────────────────────────────────┐
│  📋 COTIZACIÓN INTELIGENTE                             │
│  ────────────────────────────────────────────────────── │
│                                                         │
│  🏢 CLIENTE                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Nombre: [________________] RUC: [________]      │   │
│  │ Teléfono: [____________] Email: [____________]  │   │
│  │ ✅ Cliente encontrado / ➕ Crear nuevo          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📁 PROYECTO                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Nombre: [________________]                      │   │
│  │ Ubicación: [________________]                  │   │
│  │ ✅ Proyecto creado / ➕ Crear nuevo             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📋 COTIZACIÓN                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Variante: [Dropdown] Fecha: [____]              │   │
│  │ Ítems: [Tabla dinámica]                          │   │
│  │ Condiciones: [Textarea]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  💾 [GUARDAR BORRADOR] [📄 GENERAR PDF] [📋 CLONAR]   │
│  ✅ Guardado automáticamente hace 30 segundos         │
└─────────────────────────────────────────────────────────┘
```

## 🔧 **TECNOLOGÍAS Y ARCHIVOS**

### **Frontend**
- **Archivo principal**: `frontend/src/pages/CotizacionInteligente.jsx`
- **Componentes**: 
  - `ClienteSection.jsx`
  - `ProyectoSection.jsx` 
  - `CotizacionSection.jsx`
  - `AutoSaveIndicator.jsx`
- **Estilos**: `frontend/src/styles/CotizacionInteligente.css`

### **Backend**
- **API endpoints**:
  - `POST /api/cotizaciones/inteligente` - Crear/actualizar
  - `GET /api/cotizaciones/autocomplete` - Autocompletado
  - `POST /api/cotizaciones/clonar` - Clonar cotización
- **Servicios**:
  - `AutoSaveService.js` - Auto-guardado
  - `IntelligentFormService.js` - Lógica del formulario

## 📊 **FUNCIONALIDADES CLAVE**

### **Auto-guardado Inteligente**
- ⏰ **Intervalo**: Cada 30 segundos
- 🔄 **Detección de cambios**: Solo guarda si hay cambios
- 💾 **Estrategia**: Guardar como borrador automáticamente
- ✅ **Feedback visual**: "✅ Guardado automáticamente"

### **Autocompletado Inteligente**
- 🔍 **Búsqueda de clientes**: Por nombre, RUC, teléfono
- 📋 **Sugerencias**: Clientes similares
- ➕ **Creación automática**: Si no existe, crear nuevo
- 🔗 **Vinculación**: Cliente → Proyectos → Cotizaciones

### **Gestión Post-Cotización**
- ✏️ **Editar**: Modificar cotización existente
- 📋 **Clonar**: Mismo cliente, nuevo proyecto
- 📄 **PDF**: Generar PDF inmediatamente
- 📊 **Historial**: Ver todas las cotizaciones del cliente

## 🎯 **BENEFICIOS ESPERADOS**

### **Para Usuarios No Técnicos**
- ✅ **Simplicidad**: Un solo formulario
- ✅ **Intuitividad**: Iconos grandes y claros
- ✅ **Seguridad**: Auto-guardado automático
- ✅ **Eficiencia**: Menos clics, más productividad

### **Para el Sistema**
- ✅ **Organización**: Módulos bien estructurados
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Mantenibilidad**: Código limpio y documentado
- ✅ **Rendimiento**: Auto-guardado optimizado

## 📅 **CRONOGRAMA**

### **Semana 1: FASE 1**
- [ ] Crear formulario unificado
- [ ] Implementar auto-guardado
- [ ] Diseñar interfaz visual
- [ ] Implementar autocompletado

### **Semana 2: FASE 2**
- [ ] Crear módulos de listas
- [ ] Implementar filtros y búsqueda
- [ ] Agregar botones de acción
- [ ] Conectar con backend

### **Semana 3: FASE 3**
- [ ] Implementar vista de árbol
- [ ] Crear navegación intuitiva
- [ ] Agregar búsqueda global
- [ ] Testing y optimización

## 🚀 **PRÓXIMOS PASOS**

1. **Implementar FASE 1**: Módulo "Cotización Inteligente"
2. **Testing**: Probar con usuarios reales
3. **Feedback**: Ajustar según necesidades
4. **Implementar FASE 2**: Módulos de gestión
5. **Implementar FASE 3**: Mapeo y relaciones

---

**Fecha de creación**: 28 de septiembre de 2025
**Estado**: Planificado
**Prioridad**: Alta
**Responsable**: Equipo de desarrollo
