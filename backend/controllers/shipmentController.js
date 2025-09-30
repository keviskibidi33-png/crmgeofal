const db = require('../config/db');

const getShipmentsForCommercial = async (req, res) => {
  try {
    const shipments = [
      {
        id: 1,
        project_name: "Análisis Geotécnico Proyecto Antamina",
        description: "Estudio completo de suelos para expansión minera",
        client_name: "Minera Antamina",
        vendedor_name: "Juan Pérez",
        sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "entregado",
        tracking_number: "ENV-2025-001"
      },
      {
        id: 2,
        project_name: "Monitoreo Ambiental Cajamarca",
        description: "Seguimiento de calidad de agua y suelo",
        client_name: "Minera Yanacocha",
        vendedor_name: "María García",
        sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "en_transito",
        tracking_number: "ENV-2025-002"
      },
      {
        id: 3,
        project_name: "Estudio Sísmico Zona Norte",
        description: "Evaluación de riesgo sísmico para infraestructura",
        client_name: "Constructora del Norte",
        vendedor_name: "Carlos López",
        sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "entregado",
        tracking_number: "ENV-2025-003"
      }
    ];
    
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments for commercial:', error);
    res.status(500).json({ error: 'Error al obtener envíos' });
  }
};

// Obtener envíos para laboratorio
const getShipmentsForLaboratory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        s.*,
        p.name as project_name,
        p.description,
        c.name as client_name,
        u.name as vendedor_name,
        s.sent_at,
        s.updated_at
      FROM shipments s
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON s.sent_by = u.id
      WHERE s.status IN ('enviado', 'recibido', 'en_proceso', 'completado')
      ORDER BY s.created_at DESC
    `;
    
    const result = await db.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shipments for laboratory:', error);
    res.status(500).json({ error: 'Error al obtener envíos' });
  }
};

// Crear nuevo envío
const createShipment = async (req, res) => {
  try {
    const { project_id, notes } = req.body;
    const userId = req.user.id;
    
    const query = `
      INSERT INTO shipments (project_id, status, sent_by, notes)
      VALUES ($1, 'enviado', $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [project_id, userId, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Error al crear envío' });
  }
};

// Actualizar estado del envío
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    // Obtener archivos si se subieron
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size
    })) : [];
    
    // Actualizar estado del envío
    const updateQuery = `
      UPDATE shipments 
      SET status = $1, notes = $2, files = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [status, notes, JSON.stringify(files), id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }
    
    // Crear registro en historial de estados
    const historyQuery = `
      INSERT INTO shipment_status (shipment_id, status, notes, files, changed_by)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await db.query(historyQuery, [id, status, notes, JSON.stringify(files), userId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// Obtener detalles del envío
const getShipmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        p.name as project_name,
        p.description,
        c.name as client_name,
        u.name as vendedor_name,
        s.sent_at,
        s.updated_at
      FROM shipments s
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON s.sent_by = u.id
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }
    
    // Obtener historial de estados
    const historyQuery = `
      SELECT 
        ss.*,
        u.name as changed_by_name
      FROM shipment_status ss
      LEFT JOIN users u ON ss.changed_by = u.id
      WHERE ss.shipment_id = $1
      ORDER BY ss.changed_at DESC
    `;
    
    const historyResult = await db.query(historyQuery, [id]);
    
    res.json({
      ...result.rows[0],
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    res.status(500).json({ error: 'Error al obtener detalles del envío' });
  }
};

module.exports = {
  getShipmentsForCommercial,
  getShipmentsForLaboratory,
  createShipment,
  updateShipmentStatus,
  getShipmentDetails
};
