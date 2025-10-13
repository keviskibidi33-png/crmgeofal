# 📋 Documentación de Nuevas Funcionalidades - CRM GEOFAL

## 🗓️ Fecha de Actualización
**13 de Octubre de 2025**

---

## 🆕 Nuevas Tablas de Base de Datos

### 1. `quote_sequences`
**Propósito**: Manejo de secuencias auto-incrementales para números de cotización únicos.

```sql
CREATE TABLE quote_sequences (
  date_part VARCHAR(6) PRIMARY KEY,
  sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos**:
- `date_part`: Parte de fecha en formato YYMMDD (ej: 251013)
- `sequence`: Número secuencial del día
- `created_at`: Fecha de creación del registro
- `updated_at`: Fecha de última actualización

**Función**: Garantiza que cada cotización tenga un número único y secuencial por día.

---

## 🔧 Nuevas Funciones de Base de Datos

### 1. `get_next_quote_sequence(date_part_param VARCHAR(6))`
**Propósito**: Obtiene el siguiente número de secuencia para una fecha específica.

```sql
CREATE OR REPLACE FUNCTION get_next_quote_sequence(date_part_param VARCHAR(6))
RETURNS INTEGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  INSERT INTO quote_sequences (date_part, sequence)
  VALUES (date_part_param, 1)
  ON CONFLICT (date_part) 
  DO UPDATE SET 
    sequence = quote_sequences.sequence + 1,
    updated_at = NOW()
  RETURNING sequence INTO next_seq;
  
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;
```

**Parámetros**:
- `date_part_param`: Fecha en formato YYMMDD

**Retorna**: Número secuencial único para esa fecha

---

## 🚀 Nuevos Módulos y Funcionalidades

### 1. Sistema de Numeración Auto-incremental de Cotizaciones

#### **Archivo**: `backend/utils/quoteNumberGenerator.js`

**Funciones Principales**:

##### `generateUniqueQuoteNumber()`
- Genera números únicos para nuevas cotizaciones
- Formato: `COT-YYMMDD-YY-NNN`
- Ejemplo: `COT-251013-25-001`

##### `generateCloneQuoteNumber(originalQuoteNumber)`
- Genera números únicos para cotizaciones clonadas
- Mantiene la fecha original pero con nuevo número secuencial
- Ejemplo: Si clonas `COT-251013-25-001`, la copia será `COT-251013-25-002`

##### `isQuoteNumberUnique(quoteNumber)`
- Verifica si un número de cotización ya existe
- Retorna `true` si es único, `false` si ya existe

#### **Características**:
- ✅ **Auto-incremental**: Cada nueva cotización tiene el siguiente número
- ✅ **Único**: Garantiza que no se repitan números
- ✅ **Por fecha**: Reinicia la secuencia cada día
- ✅ **Thread-safe**: Maneja operaciones concurrentes
- ✅ **Formato consistente**: `COT-YYMMDD-YY-NNN`

---

### 2. Actualización del Sistema de Exportación PDF

#### **Archivo**: `backend/controllers/quoteExportController.js`

**Mejoras Implementadas**:

##### Función `buildFilename(bundle, ext = 'pdf')`
- **Antes**: `COT_Cliente_Asesor_2025-10-13.pdf`
- **Ahora**: `COT-251013-25-001.pdf` (usando número completo)

##### Función `exportPdfDraft`
- **Antes**: `BORRADOR_Cliente_Asesor_2025-10-13.pdf`
- **Ahora**: `BORRADOR_COT-251013-25-001.pdf`

#### **Características**:
- ✅ **Nombres únicos**: Cada archivo PDF tiene un nombre único
- ✅ **Formato consistente**: Usa el número completo de cotización
- ✅ **Sin duplicados**: Elimina problemas de archivos con sufijos `(1)`, `(2)`, etc.

---

### 3. Actualización del Template PDF

#### **Archivo**: `backend/utils/smartTemplatePdf.js`

**Función `generateQuoteNumber(bundle)`**:
- Convierte formato de BD a formato de PDF
- **BD**: `COT-251013-25-001`
- **PDF**: `COTIZACIÓN N° 0120-251013-001`

#### **Características**:
- ✅ **Formato correcto**: `COTIZACIÓN N° 0120-YYMMDD-NNN`
- ✅ **Auto-incremental**: Cada cotización muestra el número correcto
- ✅ **Consistente**: Mismo formato en todas las operaciones

---

### 4. Modelo de Cotizaciones Actualizado

#### **Archivo**: `backend/models/quote.js`

**Método `create()`**:
- Genera automáticamente números únicos al crear cotizaciones
- Maneja tanto nuevas cotizaciones como clonaciones

**Método `cloneQuote()`**:
- Clona cotizaciones con números únicos
- Copia todos los ítems de la cotización original
- Mantiene la fecha original pero con nuevo número secuencial

#### **Características**:
- ✅ **Creación automática**: Números generados automáticamente
- ✅ **Clonación inteligente**: Números únicos para clones
- ✅ **Actualización segura**: Mantiene números al actualizar

---

### 5. Modelo Avanzado de Cotizaciones

#### **Archivo**: `backend/models/quoteAdvanced.js`

**Método `createDraft()`**:
- Actualizado para usar el generador de números únicos
- **Antes**: `BORRADOR_${Date.now()}`
- **Ahora**: Usa `generateUniqueQuoteNumber()`

#### **Características**:
- ✅ **Consistencia**: Mismo sistema de numeración en todos los módulos
- ✅ **Unicidad**: Garantiza números únicos en borradores

---

## 🛠️ Scripts de Mantenimiento

### 1. `backend/scripts/updateExistingQuoteNumbers.js`
**Propósito**: Actualiza cotizaciones existentes al nuevo formato de numeración.

**Uso**:
```bash
# Verificar estado actual
node scripts/updateExistingQuoteNumbers.js --check

# Actualizar cotizaciones sin número o con formato antiguo
node scripts/updateExistingQuoteNumbers.js --update
```

### 2. `backend/scripts/createSequenceTable.js`
**Propósito**: Crea la tabla de secuencias y función necesaria para el sistema auto-incremental.

**Uso**:
```bash
node scripts/createSequenceTable.js
```

### 3. `backend/scripts/cleanDatabase.js`
**Propósito**: Limpia la base de datos eliminando datos de prueba.

**Uso**:
```bash
node scripts/cleanDatabase.js
```

### 4. `backend/scripts/backupDatabaseNode.js`
**Propósito**: Crea backup completo de la base de datos usando Node.js.

**Uso**:
```bash
node scripts/backupDatabaseNode.js
```

---

## 📊 Flujo de Numeración

### 1. **Nueva Cotización**
```
Usuario crea cotización → generateUniqueQuoteNumber() → COT-251013-25-001
```

### 2. **Clonación**
```
Usuario clona cotización → generateCloneQuoteNumber() → COT-251013-25-002
```

### 3. **Actualización**
```
Usuario actualiza cotización → Mantiene el mismo número (no se incrementa)
```

### 4. **Exportación PDF**
```
Exportar PDF → buildFilename() → COT-251013-25-001.pdf
```

### 5. **Visualización en PDF**
```
Generar PDF → generateQuoteNumber() → COTIZACIÓN N° 0120-251013-001
```

---

## 🔄 API Endpoints Actualizados

### 1. **Clonación de Cotizaciones**
```
POST /api/quotes/:id/clone
```

**Nuevo endpoint** para clonar cotizaciones con números únicos.

**Roles permitidos**: `jefa_comercial`, `vendedor_comercial`, `admin`

---

## 📁 Estructura de Archivos

### Nuevos Archivos:
```
backend/
├── utils/
│   └── quoteNumberGenerator.js          # Generador de números únicos
├── scripts/
│   ├── updateExistingQuoteNumbers.js    # Actualizador de números
│   ├── createSequenceTable.js           # Creador de tabla de secuencias
│   ├── cleanDatabase.js                 # Limpiador de base de datos
│   └── backupDatabaseNode.js            # Backup de base de datos
└── backups/
    └── crmgeofal_backup_*.sql           # Archivos de backup
```

### Archivos Modificados:
```
backend/
├── models/
│   ├── quote.js                         # Modelo actualizado
│   └── quoteAdvanced.js                 # Modelo avanzado actualizado
├── controllers/
│   ├── quoteController.js               # Controlador con clonación
│   └── quoteExportController.js         # Exportación actualizada
├── utils/
│   └── smartTemplatePdf.js              # Template PDF actualizado
└── routes/
    └── quoteRoutes.js                   # Rutas con clonación
```

---

## 🎯 Beneficios de las Nuevas Funcionalidades

### 1. **Numeración Única**
- ✅ Elimina duplicados de números de cotización
- ✅ Garantiza unicidad en todas las operaciones
- ✅ Formato consistente y profesional

### 2. **Auto-incremental**
- ✅ Secuencia automática por día
- ✅ No requiere intervención manual
- ✅ Manejo de concurrencia

### 3. **Archivos PDF Únicos**
- ✅ Nombres de archivo únicos
- ✅ Elimina problemas de duplicados
- ✅ Formato profesional

### 4. **Clonación Inteligente**
- ✅ Números únicos para clones
- ✅ Mantiene fecha original
- ✅ Copia completa de ítems

### 5. **Mantenimiento Automatizado**
- ✅ Scripts de limpieza y backup
- ✅ Actualización de datos existentes
- ✅ Verificación de integridad

---

## 🚀 Próximos Pasos

1. **Monitoreo**: Verificar que el sistema funcione correctamente en producción
2. **Backup**: Realizar backups regulares de la base de datos
3. **Documentación**: Mantener esta documentación actualizada
4. **Testing**: Probar todas las funcionalidades en diferentes escenarios

---

## 📞 Soporte

Para cualquier problema o consulta sobre las nuevas funcionalidades, contactar al equipo de desarrollo.

**Fecha de implementación**: 13 de Octubre de 2025
**Versión**: 1.0.0
**Estado**: ✅ Implementado y Funcionando
