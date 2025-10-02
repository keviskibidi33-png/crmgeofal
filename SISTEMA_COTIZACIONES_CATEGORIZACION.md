# 🎯 SISTEMA DE COTIZACIONES CON CATEGORIZACIÓN AUTOMÁTICA

## 📅 Fecha: 02 de Octubre, 2025

## 🎯 OBJETIVO
Implementar sistema de categorización automática en cotizaciones para alimentar el embudo de ventas con datos estructurados por categoría (Laboratorio/Ingeniería) y servicios específicos.

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

### **1. 📝 Frontend - Selector de Categoría**
```
┌─────────────────────────────────────────────────────────┐
│  Ítems de la Cotización                                │
├─────────────────────────────────────────────────────────┤
│  Seleccione la categoría principal:                     │
│  ○ 🧪 Laboratorio    ● ⚙️ Ingeniería                  │
│                                                         │
│  [Tabla de items existente - SIN CAMBIOS]              │
└─────────────────────────────────────────────────────────┘
```

### **2. 🔧 Backend - Mapeo Automático**
- **Usuario selecciona:** 🧪 Laboratorio
- **Usuario agrega items:** SU36, AG20, CO01, etc.
- **Backend mapea automáticamente:**
  - SU36 → ENSAYO ESTÁNDAR → Laboratorio
  - AG20 → ENSAYO AGREGADO → Laboratorio  
  - CO01 → ENSAYO CONCRETO → Laboratorio

### **3. 📊 Embudo de Ventas - Datos Estructurados**
```
┌─────────────────────────────────────────────────────────┐
│  📊 EMBUDO DE VENTAS POR CATEGORÍA                     │
├─────────────────────────────────────────────────────────┤
│  🧪 LABORATORIO: S/ 45,230 (23 cotizaciones)          │
│  ├─ ENSAYO ESTÁNDAR: S/ 12,500 (8 cotizaciones)       │
│  ├─ ENSAYO AGREGADO: S/ 8,200 (5 cotizaciones)        │
│  ├─ ENSAYO CONCRETO: S/ 15,300 (7 cotizaciones)       │
│  └─ ENSAYO ALBAÑILERÍA: S/ 9,230 (3 cotizaciones)     │
│                                                         │
│  ⚙️ INGENIERÍA: S/ 32,100 (15 cotizaciones)           │
│  ├─ DISEÑO ESTRUCTURAL: S/ 18,500 (7 cotizaciones)     │
│  └─ CONSULTORÍA TÉCNICA: S/ 13,600 (8 cotizaciones)   │
│                                                         │
│  🔍 FILTROS: [Todas] [Laboratorio] [Ingeniería]        │
│  📈 SERVICIOS MÁS VENDIDOS: ENSAYO CONCRETO (7 ventas) │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### **1. Modificar tabla quotes**
```sql
-- Agregar categoría principal a cotizaciones
ALTER TABLE quotes ADD COLUMN category_main VARCHAR(20) DEFAULT 'laboratorio';
-- Valores: 'laboratorio' | 'ingenieria'
```

### **2. Modificar tabla quote_items**
```sql
-- Agregar servicio padre a items
ALTER TABLE quote_items ADD COLUMN service_id INTEGER REFERENCES services(id);
-- Se llena automáticamente desde subservice_id
```

### **3. Vista para embudo de ventas**
```sql
CREATE VIEW funnel_metrics AS
SELECT 
  q.id as quote_id,
  q.category_main,
  s.name as service_name,
  s.area,
  qi.subservice_id,
  qi.name as item_name,
  qi.total as item_total,
  q.total_amount,
  q.status,
  q.created_at
FROM quotes q
JOIN quote_items qi ON q.id = qi.quote_id
JOIN subservices sub ON qi.subservice_id = sub.id
JOIN services s ON sub.service_id = s.id
WHERE q.status = 'aprobada';
```

---

## 🎨 IMPLEMENTACIÓN FRONTEND

### **1. Modificar CotizacionInteligente.jsx**
```jsx
// Agregar selector arriba de la tabla de items
<div className="row mb-3">
  <div className="col-md-12">
    <label className="form-label">Categoría Principal:</label>
    <div className="form-check form-check-inline">
      <input 
        className="form-check-input" 
        type="radio" 
        name="category_main" 
        id="laboratorio" 
        value="laboratorio"
        checked={categoryMain === 'laboratorio'}
        onChange={(e) => setCategoryMain(e.target.value)}
      />
      <label className="form-check-label" htmlFor="laboratorio">
        🧪 Laboratorio
      </label>
    </div>
    <div className="form-check form-check-inline">
      <input 
        className="form-check-input" 
        type="radio" 
        name="category_main" 
        id="ingenieria" 
        value="ingenieria"
        checked={categoryMain === 'ingenieria'}
        onChange={(e) => setCategoryMain(e.target.value)}
      />
      <label className="form-check-label" htmlFor="ingenieria">
        ⚙️ Ingeniería
      </label>
    </div>
  </div>
</div>
```

### **2. Estado del componente**
```jsx
const [categoryMain, setCategoryMain] = useState('laboratorio');
```

### **3. Envío al backend**
```jsx
const payload = {
  // ... datos existentes
  category_main: categoryMain
};
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### **1. Modificar createQuote en quotes controller**
```javascript
// Al crear cotización
const quoteResult = await pool.query(`
  INSERT INTO quotes (
    project_id, company_id, vendedor_id, issue_date, 
    total_amount, status, category_main, meta
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
  RETURNING *
`, [
  projectId, companyId, userId, issueDate, 
  totalAmount, 'borrador', categoryMain, JSON.stringify(meta)
]);
```

### **2. Modificar createQuoteItem**
```javascript
// Al crear items, mapear automáticamente
const itemResult = await pool.query(`
  INSERT INTO quote_items (
    quote_id, subservice_id, service_id, name, 
    description, unit_price, quantity, total
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`, [
  quoteId, subserviceId, serviceId, itemName,
  description, unitPrice, quantity, total
]);

// Obtener service_id desde subservice_id
const serviceId = await pool.query(
  'SELECT service_id FROM subservices WHERE id = $1',
  [subserviceId]
);
```

### **3. Al aprobar cotización**
```javascript
// Cuando se aprueba, alimentar embudo
exports.approveQuote = async (req, res) => {
  // ... lógica de aprobación existente
  
  // Actualizar métricas del embudo
  await updateFunnelMetrics(quoteId);
};
```

---

## 📊 DASHBOARD DEL EMBUDO

### **1. Endpoint para métricas**
```javascript
// GET /api/funnel/metrics
exports.getFunnelMetrics = async (req, res) => {
  const metrics = await pool.query(`
    SELECT 
      category_main,
      service_name,
      COUNT(*) as cotizaciones_count,
      SUM(total_amount) as total_ventas,
      AVG(total_amount) as promedio_venta
    FROM funnel_metrics
    GROUP BY category_main, service_name
    ORDER BY total_ventas DESC
  `);
  
  res.json({ success: true, data: metrics.rows });
};
```

### **2. Filtros del embudo**
- **Por categoría:** Laboratorio | Ingeniería | Todas
- **Por servicio:** ENSAYO ESTÁNDAR | ENSAYO AGREGADO | etc.
- **Por período:** Último mes | Último trimestre | Año actual
- **Por vendedor:** Filtro por usuario

---

## 🚀 FLUJO DE IMPLEMENTACIÓN

### **Fase 1: Base de Datos**
1. ✅ Agregar columnas a quotes y quote_items
2. ✅ Crear vista funnel_metrics
3. ✅ Script de migración de datos existentes

### **Fase 2: Backend**
1. ✅ Modificar createQuote para incluir category_main
2. ✅ Modificar createQuoteItem para mapear service_id
3. ✅ Crear endpoint de métricas del embudo
4. ✅ Integrar con flujo de aprobación

### **Fase 3: Frontend**
1. ✅ Agregar selector de categoría en formulario
2. ✅ Modificar envío de datos al backend
3. ✅ Sin cambios en tabla de items (como solicitado)

### **Fase 4: Dashboard**
1. ✅ Crear vista de métricas del embudo
2. ✅ Implementar filtros flexibles
3. ✅ Gráficos de servicios más/menos vendidos

---

## 📋 DATOS DEL EMBUDO

### **Métricas por Categoría Principal:**
- **Laboratorio:** Total ventas, cantidad cotizaciones, promedio
- **Ingeniería:** Total ventas, cantidad cotizaciones, promedio

### **Métricas por Servicio Específico:**
- **ENSAYO ESTÁNDAR:** Ventas, cotizaciones, tendencia
- **ENSAYO AGREGADO:** Ventas, cotizaciones, tendencia
- **ENSAYO CONCRETO:** Ventas, cotizaciones, tendencia
- **ENSAYO ALBAÑILERÍA:** Ventas, cotizaciones, tendencia
- **etc...**

### **Análisis de Rendimiento:**
- **Servicios más vendidos:** Ranking por ventas
- **Servicios menos vendidos:** Oportunidades de mejora
- **Tendencias mensuales:** Crecimiento por categoría
- **Análisis por vendedor:** Rendimiento individual

---

## ✅ PUNTOS CLAVE IMPLEMENTACIÓN

1. **Frontend:** Solo agregar selector arriba de tabla de items
2. **Backend:** Mapeo automático subservicio → servicio padre → categoría
3. **Activación:** Al aprobar cotización (no al guardar)
4. **Embudo:** Datos completos con filtros flexibles
5. **Sin cambios:** Tabla de items permanece igual
6. **Categorías:** Solo Laboratorio e Ingeniería (categorías principales)

---

*Sistema diseñado para optimizar el análisis de ventas y proporcionar insights valiosos para la toma de decisiones comerciales.*
