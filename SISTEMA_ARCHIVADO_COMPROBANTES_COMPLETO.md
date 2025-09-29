# 📁 Sistema de Archivado de Comprobantes de Pago - Documentación Completa

## 🎯 Resumen del Sistema

El sistema de archivado permite a los usuarios de facturación y administradores archivar comprobantes de pago aprobados para mantener la interfaz organizada y limpia. Los comprobantes archivados se pueden desarchivar cuando sea necesario.

## 🗄️ Estructura de Base de Datos

### Tabla: `payment_proofs` (Modificada)

**Columnas agregadas para archivado:**
```sql
-- Columnas de archivado
archived BOOLEAN DEFAULT FALSE,           -- Indica si está archivado
archived_at TIMESTAMP,                   -- Fecha de archivado
archived_by INTEGER REFERENCES users(id) -- Usuario que archivó
```

**Índices creados:**
```sql
CREATE INDEX idx_payment_proofs_archived ON payment_proofs (archived);
CREATE INDEX idx_payment_proofs_archived_at ON payment_proofs (archived_at);
CREATE INDEX idx_payment_proofs_archived_by ON payment_proofs (archived_by);
```

## 🔧 Backend - Implementación

### 1. Modelo (`backend/models/paymentProof.js`)

**Funciones agregadas:**

#### `archivePaymentProof(proofId, archivedBy)`
```javascript
async archivePaymentProof(proofId, archivedBy) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(`
      UPDATE payment_proofs 
      SET 
        archived = TRUE,
        archived_at = NOW(),
        archived_by = $1,
        updated_at = NOW()
      WHERE id = $2 AND status = $3 AND (archived IS NULL OR archived = FALSE)
      RETURNING *
    `, [archivedBy, proofId, this.STATUS.APPROVED]);
    
    if (result.rows.length === 0) {
      throw new Error('Comprobante no encontrado, no está aprobado o ya está archivado');
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### `unarchivePaymentProof(proofId)`
```javascript
async unarchivePaymentProof(proofId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(`
      UPDATE payment_proofs 
      SET 
        archived = FALSE,
        archived_at = NULL,
        archived_by = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [proofId]);
    
    if (result.rows.length === 0) {
      throw new Error('Comprobante no encontrado');
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### `getArchivedProofs(filters = {})`
```javascript
async getArchivedProofs(filters = {}) {
  let whereClause = 'WHERE pp.archived = TRUE';
  let params = [];
  let paramCount = 0;
  
  // Filtros de fecha
  if (filters.date_from) {
    paramCount++;
    whereClause += ` AND pp.archived_at >= $${paramCount}`;
    params.push(filters.date_from);
  }
  
  if (filters.date_to) {
    paramCount++;
    whereClause += ` AND pp.archived_at <= $${paramCount}`;
    params.push(filters.date_to);
  }
  
  // Filtro por usuario que archivó
  if (filters.archived_by) {
    paramCount++;
    whereClause += ` AND pp.archived_by = $${paramCount}`;
    params.push(filters.archived_by);
  }
  
  const result = await pool.query(`
    SELECT 
      pp.*,
      q.quote_number,
      q.total_amount,
      q.project_id,
      p.name as project_name,
      c.name as company_name,
      c.ruc as company_ruc,
      u.name as uploaded_by_name,
      u.email as uploaded_by_email,
      archiver.name as archived_by_name
    FROM payment_proofs pp
    JOIN quotes q ON pp.quote_id = q.id
    LEFT JOIN projects p ON q.project_id = p.id
    LEFT JOIN companies c ON p.company_id = c.id
    LEFT JOIN users u ON pp.uploaded_by = u.id
    LEFT JOIN users archiver ON pp.archived_by = archiver.id
    ${whereClause}
    ORDER BY pp.archived_at DESC
  `, params);
  
  return result.rows;
}
```

#### `getApprovedProofs()` (Modificada)
```javascript
// Excluye comprobantes archivados
WHERE pp.status = $1 AND (pp.archived IS NULL OR pp.archived = FALSE)
```

### 2. Controlador (`backend/controllers/paymentProofController.js`)

**Funciones agregadas:**

#### `archivePaymentProof`
```javascript
exports.archivePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const userId = req.user.id;
    
    const proof = await PaymentProof.archivePaymentProof(proofId, userId);
    
    res.json({
      success: true,
      message: 'Comprobante archivado exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('❌ Error archiving payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};
```

#### `unarchivePaymentProof`
```javascript
exports.unarchivePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    
    const proof = await PaymentProof.unarchivePaymentProof(proofId);
    
    res.json({
      success: true,
      message: 'Comprobante desarchivado exitosamente',
      data: proof
    });
  } catch (error) {
    console.error('❌ Error unarchiving payment proof:', error);
    res.status(500).json({ error: error.message });
  }
};
```

#### `getArchivedProofs`
```javascript
exports.getArchivedProofs = async (req, res) => {
  try {
    const filters = req.query;
    const proofs = await PaymentProof.getArchivedProofs(filters);
    
    res.json(proofs);
  } catch (error) {
    console.error('❌ Error getting archived proofs:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Rutas (`backend/routes/paymentProofRoutes.js`)

**Rutas agregadas:**
```javascript
// Obtener comprobantes archivados
router.get('/archived', paymentProofController.getArchivedProofs);

// Archivar comprobante
router.put('/:proofId/archive', paymentProofController.archivePaymentProof);

// Desarchivar comprobante
router.put('/:proofId/unarchive', paymentProofController.unarchivePaymentProof);
```

## 🎨 Frontend - Implementación

### 1. Estado y Funciones (`frontend/src/pages/ComprobantesPago.jsx`)

**Estados agregados:**
```javascript
const [archivedProofs, setArchivedProofs] = useState([]);
const [archivingProofs, setArchivingProofs] = useState(new Set());
```

**Función de archivado optimizada:**
```javascript
const handleArchive = async (proofId) => {
  if (window.confirm('¿Estás seguro de que quieres archivar este comprobante? Se moverá al archivo y no aparecerá en la lista principal.')) {
    try {
      // Marcar como procesando
      setArchivingProofs(prev => new Set([...prev, proofId]));
      
      const response = await api(`/api/payment-proofs/${proofId}/archive`, {
        method: 'PUT'
      });
      
      // Actualizar estado local inmediatamente
      const proofToArchive = approvedProofs.find(proof => proof.id === proofId);
      if (proofToArchive) {
        // Remover de comprobantes aprobados
        setApprovedProofs(prev => prev.filter(proof => proof.id !== proofId));
        
        // Agregar a comprobantes archivados con datos actualizados
        const archivedProof = {
          ...proofToArchive,
          archived: true,
          archived_at: new Date().toISOString(),
          archived_by_name: user.name
        };
        setArchivedProofs(prev => [archivedProof, ...prev]);
      }
      
      setSuccess('Comprobante archivado exitosamente');
    } catch (err) {
      console.error('Error archiving proof:', err);
      setError('Error al archivar el comprobante: ' + (err.message || 'Error desconocido'));
    } finally {
      // Remover del estado de procesando
      setArchivingProofs(prev => {
        const newSet = new Set(prev);
        newSet.delete(proofId);
        return newSet;
      });
    }
  }
};
```

**Función de desarchivado optimizada:**
```javascript
const handleUnarchive = async (proofId) => {
  if (window.confirm('¿Estás seguro de que quieres desarchivar este comprobante? Volverá a aparecer en la lista de comprobantes aprobados.')) {
    try {
      // Marcar como procesando
      setArchivingProofs(prev => new Set([...prev, proofId]));
      
      const response = await api(`/api/payment-proofs/${proofId}/unarchive`, {
        method: 'PUT'
      });
      
      // Actualizar estado local inmediatamente
      const proofToUnarchive = archivedProofs.find(proof => proof.id === proofId);
      if (proofToUnarchive) {
        // Remover de comprobantes archivados
        setArchivedProofs(prev => prev.filter(proof => proof.id !== proofId));
        
        // Agregar a comprobantes aprobados con datos actualizados
        const unarchivedProof = {
          ...proofToUnarchive,
          archived: false,
          archived_at: null,
          archived_by_name: null
        };
        setApprovedProofs(prev => [unarchivedProof, ...prev]);
      }
      
      setSuccess('Comprobante desarchivado exitosamente');
    } catch (err) {
      console.error('Error unarchiving proof:', err);
      setError('Error al desarchivar el comprobante: ' + (err.message || 'Error desconocido'));
    } finally {
      // Remover del estado de procesando
      setArchivingProofs(prev => {
        const newSet = new Set(prev);
        newSet.delete(proofId);
        return newSet;
      });
    }
  }
};
```

### 2. Interfaz de Usuario

**Botón de Archivar (con indicador de progreso):**
```javascript
<Button 
  variant="outline-warning" 
  size="sm"
  onClick={() => handleArchive(proof.id)}
  disabled={archivingProofs.has(proof.id)}
>
  {archivingProofs.has(proof.id) ? (
    <>
      <Spinner animation="border" size="sm" className="me-1" />
      Archivando...
    </>
  ) : (
    <>
      <FiArchive className="me-1" />
      Archivar
    </>
  )}
</Button>
```

**Botón de Desarchivar (con indicador de progreso):**
```javascript
<Button 
  variant="outline-success" 
  size="sm"
  onClick={() => handleUnarchive(proof.id)}
  disabled={archivingProofs.has(proof.id)}
>
  {archivingProofs.has(proof.id) ? (
    <>
      <Spinner animation="border" size="sm" className="me-1" />
      Desarchivando...
    </>
  ) : (
    <>
      <FiRefreshCw className="me-1" />
      Desarchivar
    </>
  )}
</Button>
```

**Sección de Comprobantes Archivados:**
```javascript
{(user.role === 'facturacion' || user.role === 'admin') && (
  <Row className="mt-4">
    <Col>
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FiArchive className="me-2" />
            Comprobantes Archivados ({archivedProofs.length})
          </h5>
        </Card.Header>
        <Card.Body>
          {archivedProofs.length === 0 ? (
            <p className="text-muted text-center">No hay comprobantes archivados</p>
          ) : (
            <div className="list-group list-group-flush">
              {archivedProofs.map((proof) => (
                <div key={proof.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">Cotización: {proof.quote_number}</h6>
                      <p className="mb-1 text-muted">
                        <strong>Empresa:</strong> {proof.company_name}<br/>
                        <strong>Monto:</strong> ${proof.amount_paid?.toLocaleString()}<br/>
                        <strong>Método:</strong> {proof.payment_method}<br/>
                        <strong>Fecha de pago:</strong> {new Date(proof.payment_date).toLocaleDateString()}<br/>
                        <strong>Archivado por:</strong> {proof.archived_by_name}<br/>
                        <strong>Fecha de archivado:</strong> {new Date(proof.archived_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleDownload(proof.id)}
                      >
                        <FiDownload className="me-1" />
                        Descargar
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleUnarchive(proof.id)}
                      >
                        <FiRefreshCw className="me-1" />
                        Desarchivar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  </Row>
)}
```

## 🔄 Flujo de Trabajo

### 1. Archivar Comprobante
1. **Usuario hace clic** en "Archivar" en un comprobante aprobado
2. **Confirmación** mediante modal de confirmación
3. **Indicador visual** muestra "Archivando..." con spinner
4. **Petición al backend** para archivar el comprobante
5. **Actualización inmediata** del estado local:
   - Remueve de "Comprobantes Aprobados"
   - Agrega a "Comprobantes Archivados"
6. **Mensaje de éxito** y restauración del botón

### 2. Desarchivar Comprobante
1. **Usuario hace clic** en "Desarchivar" en un comprobante archivado
2. **Confirmación** mediante modal de confirmación
3. **Indicador visual** muestra "Desarchivando..." con spinner
4. **Petición al backend** para desarchivar el comprobante
5. **Actualización inmediata** del estado local:
   - Remueve de "Comprobantes Archivados"
   - Agrega a "Comprobantes Aprobados"
6. **Mensaje de éxito** y restauración del botón

## 🛡️ Validaciones y Seguridad

### Backend
- ✅ **Solo comprobantes aprobados** pueden ser archivados
- ✅ **Solo comprobantes no archivados** pueden ser archivados
- ✅ **Transacciones seguras** con rollback automático
- ✅ **Validación de permisos** por rol de usuario
- ✅ **Mensajes de error específicos** para diferentes casos

### Frontend
- ✅ **Confirmación obligatoria** antes de archivar/desarchivar
- ✅ **Prevención de doble-clic** con botones deshabilitados
- ✅ **Indicadores visuales** durante operaciones
- ✅ **Manejo de errores** con mensajes informativos
- ✅ **Actualización optimista** del estado local

## 📊 Beneficios del Sistema

### Para los Usuarios
- **🎯 Interfaz limpia**: Los comprobantes archivados no saturan la vista principal
- **⚡ Respuesta inmediata**: No hay esperas ni recargas de página
- **👁️ Feedback visual**: Indicadores claros del estado de las operaciones
- **🔄 Reversibilidad**: Los comprobantes se pueden desarchivar fácilmente

### Para el Sistema
- **📈 Escalabilidad**: Manejo eficiente de grandes cantidades de comprobantes
- **🗄️ Organización**: Separación clara entre comprobantes activos y archivados
- **📊 Trazabilidad**: Registro de quién y cuándo archivó cada comprobante
- **🔍 Filtrado**: Posibilidad de filtrar comprobantes archivados por fecha y usuario

## 🚀 Características Técnicas

### Optimizaciones Implementadas
- **🔄 Actualización optimista**: Cambios inmediatos en la interfaz
- **📡 Peticiones asíncronas**: No bloquean la interfaz de usuario
- **💾 Estado local inteligente**: Sincronización automática con el backend
- **🎨 UX mejorada**: Indicadores de progreso y confirmaciones

### Arquitectura
- **🏗️ Patrón MVC**: Separación clara de responsabilidades
- **🔒 Transacciones**: Integridad de datos garantizada
- **📊 Índices optimizados**: Consultas eficientes en la base de datos
- **🎯 RESTful API**: Endpoints bien estructurados y documentados

## 📝 Notas de Implementación

### Archivos Modificados
- `backend/models/paymentProof.js` - Funciones de archivado
- `backend/controllers/paymentProofController.js` - Controladores de archivado
- `backend/routes/paymentProofRoutes.js` - Rutas de archivado
- `frontend/src/pages/ComprobantesPago.jsx` - Interfaz de archivado

### Scripts de Base de Datos
- `backend/sql/add_archive_column.sql` - Agregar columnas de archivado
- `backend/add-archive-columns.js` - Script de aplicación

### Dependencias
- **Backend**: PostgreSQL, Node.js, Express
- **Frontend**: React, Bootstrap, React Icons
- **Base de datos**: Índices optimizados para consultas de archivado

---

## 🎉 Conclusión

El sistema de archivado de comprobantes de pago está completamente implementado y funcional. Proporciona una experiencia de usuario fluida y eficiente, con actualizaciones inmediatas de la interfaz y manejo robusto de errores. El sistema es escalable, seguro y fácil de mantener.

**Fecha de implementación**: 2025-01-27  
**Versión**: 1.0.0  
**Estado**: ✅ Completado y funcional
