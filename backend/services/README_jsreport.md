# Integración con jsreport para Generación de PDFs

Este módulo proporciona una integración completa con jsreport para la generación de PDFs de cotizaciones en el sistema CRMGeoFal.

## 📋 Requisitos Previos

1. **Servidor jsreport ejecutándose**: El servidor debe estar corriendo en `http://localhost:5488`
2. **Plantilla "cotizacion"**: Debe existir una plantilla con este nombre en jsreport
3. **Dependencias**: `axios` debe estar instalado en el proyecto

## 🚀 Instalación

```bash
# Instalar dependencias (si no están instaladas)
npm install axios

# Asegurar que el servidor jsreport esté ejecutándose
cd servidor_reportes
node server.js
```

## 📁 Estructura de Archivos

```
backend/
├── services/
│   ├── jsreportService.js          # Servicio principal de integración
│   └── README_jsreport.md          # Este archivo
├── controllers/
│   └── quoteJsreportController.js  # Controlador para endpoints
├── routes/
│   └── quoteJsreportRoutes.js      # Rutas de la API
└── scripts/
    └── test-jsreport-integration.js # Script de prueba
```

## 🔧 Uso Básico

### 1. Función Principal

```javascript
const { generarCotizacionPDF } = require('./services/jsreportService');

// Datos de ejemplo
const datosCotizacion = {
    numeroCotizacion: "COT-2025-001",
    fechaEmision: "2025-01-11",
    cliente: {
        nombre: "Empresa ABC S.A.C.",
        ruc: "20123456789",
        contacto: "Juan Pérez",
        telefono: "(01) 234-5678",
        correo: "juan@empresa.com"
    },
    proyecto: {
        nombre: "Proyecto de Prueba",
        ubicacion: "Lima, Perú"
    },
    asesor: {
        nombre: "Pedro Martínez"
    },
    items: [
        {
            codigo: "S001",
            descripcion: "Servicio de consultoría",
            norma: "NTP 123",
            cantidad: 1,
            costoParcial: "500.00"
        }
    ],
    totales: {
        parcial: "500.00",
        igv: "90.00",
        total: "590.00"
    }
};

// Generar PDF
const rutaPDF = await generarCotizacionPDF(datosCotizacion);
if (rutaPDF) {
    console.log('PDF generado en:', rutaPDF);
} else {
    console.log('Error al generar PDF');
}
```

### 2. Endpoints de la API

#### Generar PDF de cotización existente
```http
POST /api/quotes/:id/generate-pdf
```

#### Generar PDF con datos personalizados
```http
POST /api/quotes/generate-pdf-custom
Content-Type: application/json

{
    "datosCotizacion": {
        "numeroCotizacion": "COT-2025-001",
        "fechaEmision": "2025-01-11",
        "cliente": { ... },
        "proyecto": { ... },
        "asesor": { ... },
        "items": [ ... ],
        "totales": { ... }
    }
}
```

#### Verificar estado del servidor
```http
GET /api/quotes/jsreport-status
```

## 🧪 Pruebas

### Ejecutar script de prueba
```bash
node backend/scripts/test-jsreport-integration.js
```

### Verificar servidor jsreport
```bash
curl http://localhost:5488/api/version
```

## 📊 Estructura de Datos

### Formato de Entrada

```javascript
{
    numeroCotizacion: "string",     // Número de cotización
    fechaEmision: "YYYY-MM-DD",     // Fecha de emisión
    cliente: {
        nombre: "string",           // Nombre de la empresa
        ruc: "string",              // RUC (11 dígitos)
        contacto: "string",         // Nombre del contacto
        telefono: "string",         // Teléfono
        correo: "string"            // Email
    },
    proyecto: {
        nombre: "string",           // Nombre del proyecto
        ubicacion: "string"         // Ubicación del proyecto
    },
    asesor: {
        nombre: "string"            // Nombre del asesor
    },
    referencia: "string",           // Referencia (opcional)
    items: [
        {
            codigo: "string",       // Código del servicio
            descripcion: "string",  // Descripción
            norma: "string",        // Norma aplicable
            cantidad: number,       // Cantidad
            costoParcial: "string"  // Costo (formato decimal)
        }
    ],
    totales: {
        parcial: "string",          // Subtotal
        igv: "string",              // IGV
        total: "string"             // Total
    }
}
```

## 🔍 Funciones Auxiliares

### Verificar servidor jsreport
```javascript
const { verificarServidorJsreport } = require('./services/jsreportService');

const disponible = await verificarServidorJsreport();
console.log('Servidor disponible:', disponible);
```

### Obtener información de plantilla
```javascript
const { obtenerInfoPlantilla } = require('./services/jsreportService');

const plantilla = await obtenerInfoPlantilla();
console.log('Plantilla:', plantilla);
```

## ⚠️ Manejo de Errores

La función `generarCotizacionPDF` maneja automáticamente los siguientes errores:

- **Servidor no disponible**: Retorna `null` si jsreport no está ejecutándose
- **Plantilla no encontrada**: Retorna `null` si la plantilla "cotizacion" no existe
- **Datos inválidos**: Retorna `null` si los datos no tienen el formato correcto
- **Error de red**: Retorna `null` si hay problemas de conectividad
- **Error de archivo**: Retorna `null` si no se puede guardar el PDF

## 📝 Logs

El servicio genera logs detallados para facilitar el debugging:

- `🔄` Inicio de proceso
- `📤` Envío de petición
- `✅` Operación exitosa
- `❌` Error
- `📁` Creación de directorio
- `💾` Guardado de archivo

## 🔧 Configuración

### Personalizar directorio de salida
Modifica la variable `cotizacionesDir` en `jsreportService.js`:

```javascript
const cotizacionesDir = path.join(__dirname, '../uploads/cotizaciones');
```

### Personalizar timeout
Modifica el timeout en la petición HTTP:

```javascript
const response = await axios.post(jsreportUrl, requestBody, {
    responseType: 'arraybuffer',
    timeout: 30000, // 30 segundos
    // ...
});
```

## 🚀 Integración con el Sistema Existente

Para integrar con el sistema de cotizaciones existente:

1. **Agregar rutas al servidor principal**:
```javascript
const quoteJsreportRoutes = require('./routes/quoteJsreportRoutes');
app.use('/api/quotes', quoteJsreportRoutes);
```

2. **Usar en controladores existentes**:
```javascript
const { generarCotizacionPDF } = require('../services/jsreportService');

// En tu controlador existente
const rutaPDF = await generarCotizacionPDF(datosCotizacion);
```

3. **Integrar con el frontend**:
```javascript
// Llamada desde el frontend
const response = await fetch('/api/quotes/123/generate-pdf', {
    method: 'POST'
});
const blob = await response.blob();
// Descargar o mostrar el PDF
```

## 📞 Soporte

Para problemas o dudas:

1. Verificar que jsreport esté ejecutándose: `http://localhost:5488`
2. Revisar logs del servidor jsreport
3. Ejecutar script de prueba para diagnóstico
4. Verificar formato de datos de entrada
