import React from 'react';

const BaseDashboard = ({ title, children, alerts = [], loading = false }) => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">{title}</h1>
        <div className="dashboard-subtitle">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="dashboard-alerts">
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`alert alert-${alert.type} alert-${alert.priority}`}
            >
              <div className="alert-content">
                <span className="alert-message">{alert.message}</span>
                {alert.priority && (
                  <span className="alert-priority">{alert.priority}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <span>Cargando datos del dashboard...</span>
        </div>
      ) : (
        /* Dashboard Content */
        <div className="dashboard-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default BaseDashboard;