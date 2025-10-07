# 📋 REGLAS CSS Y JSON - COTIZACIÓN INTELIGENTE

## 🎯 **Archivos Identificados:**

### **Frontend - Cotización Inteligente:**

#### **🔸 `frontend/src/pages/CotizacionInteligente.jsx`**
- **Función**: Componente principal de cotización inteligente
- **Estados**: Manejo de variantes, clientes, cotizaciones, items
- **Funciones clave**:
  - `exportDraft()`: Genera borrador PDF
  - `generateQuoteCode()`: Genera código único
  - `computePartial()`: Calcula costos parciales
  - `getVariantText()`: Obtiene texto de condiciones por variante

#### **🔸 `frontend/src/pages/CotizacionInteligente.css`**
- **Reglas principales**:
  - `.intelligent-quote-form`: Contenedor principal (max-width: 1200px)
  - `.intelligent-section`: Secciones con hover effects
  - `.section-header`: Headers con gradientes
  - `.intelligent-actions`: Botones de acción
  - `.section-content`: Contenido de secciones
  - **Colores**: #f84616 (naranja corporativo)
  - **Animaciones**: fadeInUp, pulse, hover effects

#### **🔸 `frontend/src/styles/autocomplete.css`**
- **Reglas de autocompletado**:
  - `.autocomplete-suggestions`: Dropdown de sugerencias
  - `.list-group-item`: Items de la lista
  - **Animaciones**: fadeIn para transiciones suaves
  - **Estados**: hover, focus con colores corporativos

### **Backend - Generación de PDFs:**

#### **🔸 `backend/routes/quoteRoutes.js`**
- **Endpoints identificados**:
  - `GET /:id/export/pdf-draft`: Exportar borrador PDF
  - `POST /:id/export/pdf-draft`: Exportar borrador con datos del frontend
  - **Autenticación**: Requiere roles ['jefa_comercial','vendedor_comercial','admin']

#### **🔸 `backend/controllers/quoteExportController.js`**
- **Función**: `exportPdfDraft()` - Genera PDF borrador
- **Parámetros**: ID de cotización, datos del frontend
- **Respuesta**: PDF generado para descarga

### **Templates y Estilos PDF:**

#### **🔸 `backend/utils/smartTemplatePdf.js`**
- **Función**: Procesamiento de datos para PDF
- **Lógica**: Condiciones dinámicas según variantes
- **Estructura**: Primera página, segunda página, condiciones

#### **🔸 `backend/utils/template.html`**
- **Template**: HTML para generación de PDF
- **Estructura**: Header, contenido, footer
- **Variables**: Handlebars para datos dinámicos

#### **🔸 `backend/utils/template.css`**
- **Estilos PDF**: Formato A4, márgenes, tipografía
- **Tablas**: Estilos para tablas de ensayos
- **Responsive**: Adaptación según cantidad de items

## 🎨 **Reglas CSS Principales:**

### **1. Contenedor Principal:**
```css
.intelligent-quote-form {
  max-width: 1200px;
  margin: 0 auto;
}
```

### **2. Secciones Inteligentes:**
```css
.intelligent-section {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
```

### **3. Headers con Gradientes:**
```css
.section-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-bottom: 2px solid #dee2e6;
}
```

### **4. Botones de Acción:**
```css
.intelligent-actions .btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  color: white;
}
```

### **5. Tablas de Ensayos:**
```css
.section-content .table thead th {
  background: linear-gradient(135deg, #f84616 0%, #f84616 100%);
  color: white;
  border: none;
  font-weight: 600;
}
```

## 📊 **Reglas JSON/JavaScript:**

### **1. Estados de Cotización:**
```javascript
const emptyQuote = {
  request_date: '', issue_date: '', commercial_name: '', 
  commercial_phone: '', payment_terms: 'adelantado', 
  reference: '', reference_type: ['email', 'phone'], 
  igv: true, delivery_days: 4, category_main: 'laboratorio'
};
```

### **2. Cálculo de Costos:**
```javascript
function computePartial(item) {
  const u = Number(item.unit_price || 0);
  const q = Number(item.quantity || 0);
  return Number((u * q).toFixed(2));
}
```

### **3. Generación de Código:**
```javascript
function generateQuoteCode() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `COT-${year}${month}${day}-${random}`;
}
```

### **4. Exportación de Borrador:**
```javascript
const exportDraft = async () => {
  const path = `/api/quotes/${id}/export/pdf-draft`;
  const url = `${base}${path}`;
  // Descarga del PDF borrador
};
```

## 🎯 **Variantes y Condiciones:**

### **Variantes Predefinidas:**
- **MUESTRA DE SUELO Y AGREGADO**
- **PROBETAS**
- **DENSIDAD DE CAMPO Y MUESTREO**
- **EXTRACCIÓN DE DIAMANTINA**
- **DIAMANTINA PARA PASES**
- **ALBAÑILERÍA**
- **VIGA BECKELMAN**
- **CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA**

### **Condiciones Específicas:**
Cada variante tiene condiciones específicas definidas en `VARIANT_TEXTS` que se aplican automáticamente según la categoría seleccionada.

## 🚀 **Flujo de Generación de Borrador:**

1. **Frontend**: Usuario completa formulario
2. **Validación**: Estados y validaciones en tiempo real
3. **Guardado**: `status: 'borrador'` en base de datos
4. **Exportación**: Llamada a `/api/quotes/:id/export/pdf-draft`
5. **Backend**: Procesamiento con `smartTemplatePdf.js`
6. **PDF**: Generación con `template.html` y `template.css`
7. **Descarga**: Archivo PDF con nombre `cotizacion-borrador-${id}.pdf`

## 📋 **Características Técnicas:**

### **Responsive Design:**
- **Mobile**: Adaptación de botones y secciones
- **Tablet**: Optimización de espaciado
- **Desktop**: Máximo ancho de 1200px

### **Animaciones:**
- **fadeInUp**: Aparición de secciones
- **pulse**: Estado de guardado
- **hover**: Efectos en botones y elementos

### **Estados de Validación:**
- **is-valid**: Campos correctos (verde)
- **is-invalid**: Campos con errores (rojo)
- **Estados de guardado**: Indicadores visuales

## ✅ **Resumen:**

La cotización inteligente utiliza un sistema completo de reglas CSS y JSON que incluye:
- **Frontend**: Componente React con estilos avanzados
- **Backend**: APIs para generación de PDFs
- **Templates**: HTML/CSS para formato de documentos
- **Autenticación**: Control de acceso por roles
- **Responsive**: Adaptación a diferentes dispositivos
- **Animaciones**: Experiencia de usuario mejorada
