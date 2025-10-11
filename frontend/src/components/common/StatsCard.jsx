import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import './StatsCard.css';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend = null,
  loading = false,
  className = "",
  size = 'normal' // 'compact', 'normal', 'large'
}) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary bg-opacity-10 text-primary',
      success: 'bg-success bg-opacity-10 text-success',
      warning: 'bg-warning bg-opacity-10 text-warning',
      danger: 'bg-danger bg-opacity-10 text-danger',
      info: 'bg-info bg-opacity-10 text-info',
      secondary: 'bg-secondary bg-opacity-10 text-secondary'
    };
    return colors[color] || colors.primary;
  };

  const getTrendIcon = (trend) => {
    if (!trend || trend === 0) return null;
    
    if (trend > 0) {
      return (
        <span className="text-success small">
          <i className="bi bi-arrow-up"></i> +{trend}%
        </span>
      );
    } else if (trend < 0) {
      return (
        <span className="text-danger small">
          <i className="bi bi-arrow-down"></i> {trend}%
        </span>
      );
    }
    return null;
  };

  const formatValue = (val) => {
    if (loading) return <Spinner size="sm" className="me-1" />;
    
    if (typeof val === 'number') {
      // Formatear números grandes de manera más compacta
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={`stats-card stats-card-${size} ${color} ${loading ? 'loading' : ''} ${className}`}>
      <Card.Body className="stats-card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div className="flex-grow-1 stats-content">
            <div className="stats-title">{title}</div>
            <div className="stats-value">
              {formatValue(value)}
            </div>
            {subtitle && (
              <div className="stats-subtitle">{subtitle}</div>
            )}
            {trend && trend !== 0 && !loading && (
              <div className="stats-trend">
                {getTrendIcon(trend)}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="stats-icon">
              <Icon size={size === 'compact' ? 16 : size === 'large' ? 28 : 20} />
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
