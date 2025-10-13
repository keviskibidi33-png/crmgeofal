# Módulo de Importación de Clientes - SEGUIMIENTO DE CLIENTES

## Descripción

Este módulo permite importar datos completos de clientes desde el archivo Excel "SEGUIMIENTO DE CLIENTES 2025" al sistema CRM. El proceso incluye limpieza de datos existentes y mapeo inteligente de información.

## Características

### ✅ Funcionalidades Implementadas

1. **Limpieza de Datos Existentes**
   - Elimina todos los usuarios (excepto administradores)
   - Elimina todos los proyectos y cotizaciones
   - Elimina todos los clientes existentes
   - Proceso seguro con confirmación requerida

2. **Importación de Clientes**
   - Lectura de archivos CSV con formato específico
   - Validación de datos (email, RUC, campos requeridos)
   - Mapeo inteligente de estados y prioridades
   - Detección automática de ciudades y sectores
   - Manejo de duplicados (actualización vs creación)

3. **Mapeo de Datos**
   - **Estados**: PROSPECTO → prospeccion, CIERRE-GANADO → ganado, etc.
   - **Prioridades**: Basadas en ALERTA ACTIVIDAD (valores negativos)
     - -3 a 0 días = Urgente
     - -4 a -7 días = Alta prioridad
     - -8 a -14 días = Normal
     - -15+ días = Baja prioridad
   - **Sectores**: Detectados automáticamente de comentarios + prioridad integrada
   - **Ciudades**: Extraídas de comentarios

4. **Interfaz de Usuario**
   - Panel de administración exclusivo para administradores
   - Estadísticas en tiempo real
   - Progreso de importación
   - Reportes detallados de resultados
   - Validación de archivos (CSV, máximo 10MB)

## Estructura del Archivo CSV

El archivo debe tener las siguientes columnas:

| Columna | Descripción | Requerido | Ejemplo |
|---------|-------------|-----------|---------|
| No | Número de registro | Sí | 1, 2, 3... |
| FECHA CREACIÓN | Fecha de creación | No | 25-sep.-25 |
| ASESOR | Asesor asignado | No | (vacío) |
| PERSONA CONTACTO | Nombre del contacto | Sí | ING. KARIN POLINARIO |
| NÚMERO CELULAR | Teléfono | No | 980164830 |
| E-MAIL | Email de contacto | No | kanopolinario@hotmail.com |
| RAZON SOCIAL | Nombre empresa/persona | Sí | GEOTECNICOS & GEOFISICOS |
| RUC | RUC de la empresa | No | 20523340809 |
| ESTADO | Estado del cliente | No | ENVÍO DE COTIZACIÓN |
| FECHA CIERRE | Fecha de cierre | No | 25-sep.-25 |
| ACTIVIDAD | Tipo de actividad | No | CORREO |
| FECHA PRÓXIMO ACTIVIDAD | Próxima actividad | No | 25-sep.-25 |
| ALERTA ACTIVIDAD | Días de alerta | No | -18 |
| COMENTARIOS | Comentarios adicionales | No | se envio su cotizacion... |
| SERVICIO | Tipo de servicio | No | LABORATORIO |
| N° COTIZACIÓN | Número de cotización | No | 1554-25 |
| COSTO SIN IGV | Costo sin IGV | No | S/ 247.80 |

## Instalación y Configuración

### 1. Dependencias del Backend

```bash
cd backend
npm install csv-parser
```

### 2. Configuración de Base de Datos

No se requieren migraciones adicionales. El sistema utiliza el campo `sector` existente para almacenar la información de prioridad de manera inteligente.

### 3. Estructura de Archivos

```
backend/
├── controllers/
│   └── clientImportController.js    # Controlador principal
├── routes/
│   └── clientImport.js              # Rutas de la API
└── tmp/                             # Directorio temporal

frontend/
├── src/
│   ├── pages/
│   │   └── ClientImport.jsx         # Página de importación
│   ├── services/
│   │   └── clientImportService.js   # Servicio de API
│   └── pages/
│       └── ClientImport.css         # Estilos
```

## Uso del Módulo

### 1. Acceso al Módulo

- Solo usuarios con rol `admin` pueden acceder
- Ruta: `/clientes/importar`
- Enlace en el menú lateral: "Importar Clientes"

### 2. Proceso de Importación

1. **Limpieza de Datos** (Opcional pero recomendado)
   - Hacer clic en "Limpiar Datos Existentes"
   - Escribir "CONFIRMAR" para proceder
   - ⚠️ **ADVERTENCIA**: Esta acción es irreversible

2. **Importación de Clientes**
   - Seleccionar archivo CSV
   - Hacer clic en "Importar Clientes"
   - Monitorear el progreso
   - Revisar resultados y errores

### 3. Resultados de Importación

El sistema muestra:
- Número de clientes importados exitosamente
- Número de errores encontrados
- Lista de clientes creados/actualizados
- Detalles de errores de validación

## API Endpoints

### POST `/api/client-import/clean`
Limpia todos los datos existentes excepto administradores.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Datos limpiados exitosamente",
  "data": {
    "deletedQuotes": "Todas las cotizaciones eliminadas",
    "deletedProjects": "Todos los proyectos eliminados",
    "deletedClients": "Todos los clientes eliminados",
    "deletedUsers": "Usuarios no administradores eliminados",
    "remainingAdmins": 1
  }
}
```

### POST `/api/client-import/import`
Importa clientes desde archivo CSV.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <archivo_csv>
```

**Response:**
```json
{
  "success": true,
  "message": "Importación completada: 42 clientes importados, 0 fallaron",
  "data": {
    "totalProcessed": 42,
    "successful": 42,
    "failed": 0,
    "errors": [],
    "importedClients": [...]
  }
}
```

### GET `/api/client-import/stats`
Obtiene estadísticas de clientes importados.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "empresas": 35,
    "personas": 7,
    "conEmail": 40,
    "conTelefono": 38
  }
}
```

## Validaciones y Reglas de Negocio

### Validaciones de Datos
- **Persona Contacto**: Campo requerido
- **Razón Social**: Campo requerido
- **Email**: Formato válido si se proporciona
- **RUC**: 11 dígitos si se proporciona

### Mapeo de Estados
- `PROSPECTO` → `prospeccion`
- `CONTACTADO` → `interesado`
- `ENVÍO DE COTIZACIÓN` → `cotizacion_enviada`
- `CIERRE-GANADO` → `ganado`
- `NO CONTESTO` → `perdido`

### Mapeo de Prioridades
- `-3 a 0` días → `urgent` (se almacena como `[PRIORIDAD: URGENTE]`)
- `-4 a -7` días → `high` (se almacena como `[PRIORIDAD: ALTA]`)
- `-8 a -14` días → `normal` (se almacena como `[PRIORIDAD: NORMAL]`)
- `-15+` días → `low` (se almacena como `[PRIORIDAD: BAJA]`)

**Nota**: Las prioridades se almacenan integradas en el campo `sector` usando el formato: `"SECTOR [PRIORIDAD: nivel]"`

### Sistema de Prioridades Integrado

El sistema utiliza una solución inteligente que combina el sector y la prioridad en un solo campo:

- **Almacenamiento**: `"Laboratorio [PRIORIDAD: URGENTE]"`
- **Visualización**: El frontend separa automáticamente el sector base de la prioridad
- **Ventajas**: 
  - No requiere cambios en la base de datos
  - Mantiene compatibilidad con el sistema existente
  - Permite filtrado por sector y prioridad
  - Fácil de entender y mantener

### Detección de Sectores
- Construcción, Minería, Ingeniería, Laboratorio, etc.
- Basado en análisis de comentarios

### Detección de Ciudades
- Lima, Arequipa, Cusco, Trujillo, etc.
- Extraída de comentarios

## Seguridad

- Solo administradores pueden acceder al módulo
- Validación de archivos (tipo y tamaño)
- Transacciones de base de datos para integridad
- Limpieza automática de archivos temporales

## Monitoreo y Logs

El sistema registra:
- Progreso de importación
- Errores de validación
- Operaciones de limpieza
- Estadísticas de importación

## Solución de Problemas

### Error: "No se encontraron registros válidos"
- Verificar formato del archivo CSV
- Asegurar que las columnas tengan los nombres correctos
- Verificar que no esté vacío

### Error: "Archivo demasiado grande"
- El límite es 10MB
- Comprimir o dividir el archivo si es necesario

### Error: "Solo se permiten archivos CSV"
- Verificar extensión del archivo
- Asegurar que el archivo sea realmente CSV

## Próximas Mejoras

- [ ] Importación incremental (sin limpiar datos)
- [ ] Mapeo personalizable de campos
- [ ] Plantilla de ejemplo descargable
- [ ] Historial de importaciones
- [ ] Rollback de importaciones
- [ ] Importación programada

## Soporte

Para soporte técnico o reportar problemas:
- Revisar logs del sistema
- Verificar permisos de usuario
- Contactar al administrador del sistema
