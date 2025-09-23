import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FiTarget, FiSave, FiX } from 'react-icons/fi';

const GoalConfigModal = ({ show, onHide, currentGoal, onSave, year, month, isLoading }) => {
  const [goalAmount, setGoalAmount] = useState('');
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  useEffect(() => {
    if (show) {
      setSelectedYear(year);
      setSelectedMonth(month);
      if (currentGoal && currentGoal.has_goal) {
        setGoalAmount(currentGoal.goal_quantity?.toString() || '');
      } else {
        setGoalAmount('');
      }
      setError('');
    }
  }, [currentGoal, show, year, month]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!goalAmount || parseInt(goalAmount) <= 0) {
      setError('La cantidad de ventas debe ser mayor a 0');
      return;
    }

    onSave({
      year: parseInt(selectedYear),
      month: parseInt(selectedMonth),
      goal_quantity: parseInt(goalAmount)
    });
  };

  const handleClose = () => {
    setGoalAmount('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="sm" centered>
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="fs-6">
          <FiTarget className="me-1" />
          Meta Mensual
        </Modal.Title>
      </Modal.Header>
              <Modal.Body className="py-3">
                <div className="mb-3">
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Año</Form.Label>
                        <Form.Select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          size="sm"
                        >
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Mes</Form.Label>
                        <Form.Select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          size="sm"
                        >
                          <option value="1">Enero</option>
                          <option value="2">Febrero</option>
                          <option value="3">Marzo</option>
                          <option value="4">Abril</option>
                          <option value="5">Mayo</option>
                          <option value="6">Junio</option>
                          <option value="7">Julio</option>
                          <option value="8">Agosto</option>
                          <option value="9">Septiembre</option>
                          <option value="10">Octubre</option>
                          <option value="11">Noviembre</option>
                          <option value="12">Diciembre</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label className="mb-1">Cantidad de Ventas</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="Ej: 10"
              required
              size="sm"
            />
            <Form.Text className="text-muted small">
              Número de ventas objetivo para el mes
            </Form.Text>
          </Form.Group>

          {error && (
            <Alert variant="danger" className="py-2 px-2 mb-2">
              <small>{error}</small>
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline-secondary" size="sm" onClick={handleClose}>
              <FiX className="me-1" />
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave className="me-1" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GoalConfigModal;
