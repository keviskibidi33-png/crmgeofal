# Sistema de Evidencias para Cotizaciones

## 📋 Descripción

Sistema completo para que los vendedores puedan adjuntar evidencias documentales a las cotizaciones en 3 categorías diferentes:

1. **📸 Evidencia de Primer Contacto** - Documentos del contacto inicial con el cliente
2. **✅ Evidencias de Aceptación** - Documentos que confirman la aceptación de la cotización
3. **🏁 Evidencias de Finalización** - Documentos del cierre y finalización del proyecto

## 🎯 Características

### Formatos Aceptados
- **PDF** (`.pdf`)
- **Excel** (`.xlsx`, `.xls`)
- **Imágenes** (`.png`, `.jpg`, `.jpeg`)

### Límites
- Tamaño máximo por archivo: **10 MB**
- Múltiples archivos por categoría: **Ilimitado**

### Funcionalidades
- ✅ Subir archivos
- ✅ Descargar archivos
- ✅ Eliminar archivos
- ✅ Agregar notas a cada evidencia
- ✅ Ver quién subió cada archivo y cuándo
- ✅ Estadísticas por categoría

## 🏗️ Arquitectura

### Base de Datos
**Tabla:** `quote_evidences`

```sql
- id (SERIAL PRIMARY KEY)
- quote_id (INTEGER) - Relación con cotización
- evidence_type (ENUM) - Tipo: primer_contacto, aceptacion, finalizacion
- file_name (VARCHAR) - Nombre original del archivo
- file_path (VARCHAR) - Ruta en el servidor
- file_type (VARCHAR) - MIME type
- file_size (INTEGER) - Tamaño en bytes
- uploaded_by (INTEGER) - Usuario que subió
- uploaded_at (TIMESTAMP) - Fecha de subida
- notes (TEXT) - Notas opcionales
```

### Backend

#### Modelo
- `backend/models/QuoteEvidence.js`
- Métodos: create, findByQuoteId, findByQuoteAndType, findById, delete, updateNotes, countByQuote

#### Controlador
- `backend/controllers/quoteEvidencesController.js`
- Métodos: uploadEvidence, listEvidences, getEvidencesStats, downloadEvidence, deleteEvidence, updateEvidenceNotes

#### Rutas
- `POST /api/quotes/:id/evidences` - Subir evidencia
- `GET /api/quotes/:id/evidences` - Listar evidencias
- `GET /api/quotes/:id/evidences/stats` - Estadísticas
- `GET /api/quotes/evidences/:evidenceId/download` - Descargar
- `DELETE /api/quotes/evidences/:evidenceId` - Eliminar
- `PATCH /api/quotes/evidences/:evidenceId/notes` - Actualizar notas

### Frontend

#### Componente Principal
- `frontend/src/components/QuoteEvidences.jsx`
- Gestión completa de evidencias con interfaz intuitiva

#### Integración
- `frontend/src/pages/DetalleCotizacion.jsx`
- Sección de evidencias al final de los detalles de la cotización

## 📁 Almacenamiento

Los archivos se guardan en: `backend/uploads/evidences/{quote_id}/`

Cada cotización tiene su propio directorio para mantener organizados los archivos.

## 🔒 Seguridad

- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de tipos de archivo en backend y frontend
- ✅ Validación de tamaño de archivo
- ✅ Control de acceso por roles (vendedores, jefa comercial, admin)
- ✅ Los archivos se eliminan del sistema al borrar el registro

## 🚀 Uso

### Para Vendedores

1. Acceder a una cotización desde "Lista de Cotizaciones"
2. Hacer clic en el botón "Ver" (👁️)
3. Desplazarse a la sección "📋 Evidencias de la Cotización"
4. Hacer clic en "Subir archivo" en la categoría deseada
5. Seleccionar el archivo y opcionalmente agregar notas
6. Hacer clic en "Subir Evidencia"

### Descargar Evidencias
- Hacer clic en el botón de descarga (⬇️) junto a cada evidencia

### Eliminar Evidencias
- Hacer clic en el botón de eliminar (🗑️) junto a cada evidencia
- Confirmar la eliminación

## 📊 Estadísticas

El sistema muestra en tiempo real:
- Total de evidencias subidas
- Cantidad por categoría
- Tamaño de archivos
- Fecha y hora de subida
- Usuario que subió cada archivo

## 🎨 Interfaz de Usuario

### Características de la UI
- 🎯 Organización clara por categorías con colores distintivos
- 📱 Diseño responsive para móviles
- 🔄 Actualizaciones en tiempo real
- ✅ Notificaciones de éxito/error
- 🎭 Iconos según tipo de archivo (PDF, Excel, imagen)
- 📏 Visualización de tamaño de archivo formateado
- 👤 Información de quién subió cada archivo

### Códigos de Color
- **Azul** (primary): Evidencia de Primer Contacto
- **Verde** (success): Evidencias de Aceptación
- **Amarillo** (warning): Evidencias de Finalización

## 🛠️ Instalación

### 1. Base de Datos
```bash
node backend/scripts/create-evidences-table.js
```

### 2. Backend
Las rutas ya están integradas en `backend/routes/quoteRoutes.js`

### 3. Frontend
El componente se carga automáticamente al acceder a la página de detalle de cotización.

## 📝 Notas Técnicas

- Usa **Multer** para la gestión de archivos
- Validación de tipos MIME en servidor
- Manejo de errores robusto
- Eliminación de archivos huérfanos si falla la operación
- Nombres de archivo únicos para evitar conflictos

## 🔄 Actualizaciones Futuras Sugeridas

- [ ] Previsualización de imágenes y PDFs
- [ ] Compresión automática de imágenes
- [ ] Versionado de archivos
- [ ] Comentarios por evidencia
- [ ] Notificaciones cuando se sube nueva evidencia
- [ ] Exportar todas las evidencias en ZIP
- [ ] Búsqueda de evidencias por nombre o notas

## ✅ Estado

**IMPLEMENTADO Y FUNCIONAL** ✨

Fecha de implementación: 10 de octubre de 2025

