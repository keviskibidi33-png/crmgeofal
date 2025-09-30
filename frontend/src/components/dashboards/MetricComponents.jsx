import React from 'react';

// Componente para mostrar una métrica individual
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', 
  icon, 
  color = 'blue',
  subtitle 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val > 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val > 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      } else if (val % 1 !== 0) {
        return val.toFixed(2);
      }
    }
    return val;
  };

  const getChangeIcon = () => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➡️';
  };

  const getChangeClass = () => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-header">
        {icon && <span className="metric-icon">{icon}</span>}
        <span className="metric-title">{title}</span>
      </div>
      
      <div className="metric-value">
        {formatValue(value)}
      </div>

      {subtitle && (
        <div className="metric-subtitle">{subtitle}</div>
      )}

      {change !== undefined && (
        <div className={`metric-change ${getChangeClass()}`}>
          <span className="change-icon">{getChangeIcon()}</span>
          <span className="change-value">
            {Math.abs(change).toFixed(1)}
            {changeType === 'percentage' ? '%' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar un grupo de métricas
export const MetricsGrid = ({ children, columns = 4 }) => {
  return (
    <div className={`metrics-grid metrics-grid-${columns}`}>
      {children}
    </div>
  );
};

// Componente para mostrar progreso hacia un objetivo
export const ProgressCard = ({ 
  title, 
  current, 
  target, 
  unit = '', 
  color = 'blue' 
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  return (
    <div className={`progress-card progress-card-${color}`}>
      <div className="progress-header">
        <span className="progress-title">{title}</span>
        <span className="progress-percentage">{percentage.toFixed(0)}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="progress-details">
        <span className="progress-current">{current}{unit}</span>
        <span className="progress-target">/ {target}{unit}</span>
      </div>
    </div>
  );
};

// Componente para mostrar una lista de items con valores
export const StatsList = ({ title, items, valueFormatter = (v) => v }) => {
  return (
    <div className="stats-list">
      <h3 className="stats-list-title">{title}</h3>
      <div className="stats-list-items">
        {items.map((item, index) => (
          <div key={index} className="stats-list-item">
            <span className="item-label">{item.label || item.name}</span>
            <span className="item-value">{valueFormatter(item.value || item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para mostrar elementos recientes
export const RecentItems = ({ title, items, renderItem, maxItems = 5 }) => {
  const displayItems = items.slice(0, maxItems);
  
  return (
    <div className="recent-items">
      <h3 className="recent-items-title">{title}</h3>
      <div className="recent-items-list">
        {displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <div key={index} className="recent-item">
              {renderItem ? renderItem(item) : (
                <div className="recent-item-default">
                  <span className="item-name">{item.name || item.title}</span>
                  <span className="item-date">
                    {new Date(item.created_at || item.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-recent-items">
            No hay elementos recientes
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  MetricCard,
  MetricsGrid,
  ProgressCard,
  StatsList,
  RecentItems
};