const Audit = require('../models/audit');

exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      action, 
      user, 
      date,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd
    } = req.query;
    
    const { rows, total } = await Audit.getAll({ 
      page, 
      limit, 
      search, 
      action, 
      user, 
      date,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd
    });
    
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error en auditoría:', err);
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
};

// Obtener analytics de auditoría
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Audit.getAnalytics();
    res.json({ data: analytics });
  } catch (err) {
    console.error('Error en analytics:', err);
    res.status(500).json({ error: 'Error al obtener analytics' });
  }
};

// Obtener usuarios activos
exports.getActiveUsers = async (req, res) => {
  try {
    const users = await Audit.getActiveUsers();
    res.json({ data: users });
  } catch (err) {
    console.error('Error en usuarios activos:', err);
    res.status(500).json({ error: 'Error al obtener usuarios activos' });
  }
};

// Limpiar registros antiguos
exports.cleanup = async (req, res) => {
  try {
    const { hours = 24 } = req.body;
    const executedBy = req.user?.id || null; // Usuario que ejecuta la limpieza
    const result = await Audit.cleanup(hours, executedBy);
    res.json({ 
      message: `Se eliminaron ${result.deletedCount} registros antiguos`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error en limpieza:', err);
    res.status(500).json({ error: 'Error al limpiar registros' });
  }
};

// Obtener estadísticas de limpieza
exports.getCleanupStats = async (req, res) => {
  try {
    const stats = await Audit.getCleanupStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('Error en estadísticas de limpieza:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener distribución horaria
exports.getHourlyDistribution = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const distribution = await Audit.getHourlyDistribution(parseInt(hours));
    res.json({ data: distribution });
  } catch (err) {
    console.error('Error en distribución horaria:', err);
    res.status(500).json({ error: 'Error al obtener distribución horaria' });
  }
};

// Exportar auditoría
exports.export = async (req, res) => {
  try {
    const { format = 'excel', ...filters } = req.query;
    const data = await Audit.export(filters, format);
    
    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=auditoria.xlsx');
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=auditoria.pdf');
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=auditoria.csv');
    }
    
    res.send(data);
  } catch (err) {
    console.error('Error en exportación:', err);
    res.status(500).json({ error: 'Error al exportar auditoría' });
  }
};
