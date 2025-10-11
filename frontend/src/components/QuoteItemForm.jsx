import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiDollarSign, FiFileText, FiCalculator } from 'react-icons/fi';
import SubserviceAutocompleteFinal from './SubserviceAutocompleteFinal';

const QuoteItemForm = ({ 
  items = [], 
  onItemsChange, 
  maxItems = 50,
  showCalculations = true 
}) => {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = () => {
    if (localItems.length >= maxItems) {
      alert(`Máximo ${maxItems} ítems permitidos`);
      return;
    }

    const newItem = {
      id: Date.now(), // ID temporal
      codigo: '',
      descripcion: '',
      norma: '',
      precio_unitario: 0,
      cantidad: 1,
      parcial: 0,
      subservice_id: null
    };

    setLocalItems([...localItems, newItem]);
  };

  const removeItem = (id) => {
    setLocalItems(localItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcular parcial si cambió precio o cantidad
        if (field === 'precio_unitario' || field === 'cantidad') {
          updatedItem.parcial = updatedItem.precio_unitario * updatedItem.cantidad;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setLocalItems(updatedItems);
  };

  const handleSubserviceSelect = (id, subservice) => {
    if (subservice) {
      updateItem(id, 'codigo', subservice.codigo);
      updateItem(id, 'descripcion', subservice.descripcion);
      updateItem(id, 'norma', subservice.norma);
      updateItem(id, 'precio_unitario', subservice.precio);
      updateItem(id, 'subservice_id', subservice.id);
      updateItem(id, 'parcial', subservice.precio * localItems.find(item => item.id === id)?.cantidad || 1);
    }
  };

  const calculateTotals = () => {
    const subtotal = localItems.reduce((sum, item) => sum + (item.parcial || 0), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  const handleSave = () => {
    onItemsChange?.(localItems);
  };

  const totals = calculateTotals();

  return (
    <div className="quote-items-form">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Ítems de Cotización</h5>
          <p className="text-muted small mb-0">
            Detalle de ensayos/servicios cotizados
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="info">
            {localItems.length}/{maxItems} ítems
          </Badge>
          <Button 
            variant="primary" 
            size="sm"
            onClick={addItem}
            disabled={localItems.length >= maxItems}
          >
            <FiPlus size={14} className="me-1" />
            Agregar ítem
          </Button>
        </div>
      </div>

      {/* Tabla de ítems */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ width: '15%' }}>Código/N° ensayo</th>
              <th style={{ width: '35%' }}>Descripción</th>
              <th style={{ width: '15%' }}>Norma</th>
              <th style={{ width: '12%' }}>Unitario (S/)</th>
              <th style={{ width: '10%' }}>Cantidad</th>
              <th style={{ width: '12%' }}>Parcial (S/)</th>
              <th style={{ width: '6%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {localItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  <FiFileText size={24} className="mb-2 d-block mx-auto" />
                  No hay ítems agregados
                </td>
              </tr>
            ) : (
              localItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.codigo}
                      onChange={(e) => updateItem(item.id, 'codigo', e.target.value)}
                      placeholder="Código"
                      size="sm"
                    />
                  </td>
                  <td>
                    <SubserviceAutocomplete
                      value={item.descripcion}
                      onChange={(value) => updateItem(item.id, 'descripcion', value)}
                      onSelect={(subservice) => handleSubserviceSelect(item.id, subservice)}
                      placeholder="Buscar descripción..."
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.norma}
                      onChange={(e) => updateItem(item.id, 'norma', e.target.value)}
                      placeholder="Norma"
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.precio_unitario}
                      onChange={(e) => updateItem(item.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => updateItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      min="1"
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.parcial}
                      readOnly
                      className="bg-light"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      title="Eliminar ítem"
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cálculos */}
      {showCalculations && localItems.length > 0 && (
        <div className="mt-4">
          <Row>
            <Col md={6}>
              <Alert variant="light" className="mb-0">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <strong>S/ {totals.subtotal.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>IGV (18%):</span>
                  <strong>S/ {totals.igv.toFixed(2)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total:</span>
                  <strong className="text-success">S/ {totals.total.toFixed(2)}</strong>
                </div>
              </Alert>
            </Col>
          </Row>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-3 d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={() => setLocalItems([])}>
          Limpiar todo
        </Button>
        <Button variant="success" onClick={handleSave}>
          <FiCalculator className="me-1" />
          Guardar ítems
        </Button>
      </div>
    </div>
  );
};

export default QuoteItemForm;
