const FunnelMetrics = require('../models/funnelMetrics');

// Obtener distribución de servicios
exports.getServiceDistribution = async (req, res) => {
  try {
    const data = await FunnelMetrics.getServiceDistribution();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting services distribution:', error);
    res.status(500).json({ message: 'Error al obtener distribución de servicios', error: error.message });
  }
};

// Obtener conversión por categoría de servicio
exports.getCategoryConversionMetrics = async (req, res) => {
  try {
    const data = await FunnelMetrics.getCategoryConversionMetrics();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting conversion by service category:', error);
    res.status(500).json({ message: 'Error al obtener conversión por categoría de servicio', error: error.message });
  }
};

// Obtener tendencias mensuales
exports.getMonthlyTrends = async (req, res) => {
  try {
    const data = await FunnelMetrics.getMonthlyTrends();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting monthly approved quotes trend:', error);
    res.status(500).json({ message: 'Error al obtener tendencia mensual de cotizaciones aprobadas', error: error.message });
  }
};

// Obtener servicios subutilizados
exports.getUnderutilizedServices = async (req, res) => {
  try {
    const { threshold } = req.query;
    const data = await FunnelMetrics.getUnderutilizedServices(threshold);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting underutilized services:', error);
    res.status(500).json({ message: 'Error al obtener servicios subutilizados', error: error.message });
  }
};

// Obtener métricas de rendimiento por vendedor
exports.getSalesPerformanceMetrics = async (req, res) => {
  try {
    const data = await FunnelMetrics.getSalesPerformanceMetrics();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting salesperson performance:', error);
    res.status(500).json({ message: 'Error al obtener rendimiento de vendedores', error: error.message });
  }
};

// Obtener resumen ejecutivo
exports.getExecutiveSummary = async (req, res) => {
  try {
    const data = await FunnelMetrics.getExecutiveSummary();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting executive summary:', error);
    res.status(500).json({ message: 'Error al obtener resumen ejecutivo', error: error.message });
  }
};