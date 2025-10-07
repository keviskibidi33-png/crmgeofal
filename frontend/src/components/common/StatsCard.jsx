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
  className = ""
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
        <span className="text-success">
          <i className="bi bi-arrow-up"></i> +{trend}%
        </span>
      );
    } else if (trend < 0) {
      return (
        <span className="text-danger">
          <i className="bi bi-arrow-down"></i> {trend}%
        </span>
      );
    }
    return null;
  };

  return (
    <Card className={`stats-card ${color} ${loading ? 'loading' : ''} ${className}`}>
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="flex-grow-1">
            <h6>{title}</h6>
            <h3>
              {loading ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                typeof value === 'number' ? value.toLocaleString() : value
              )}
            </h3>
            {subtitle && (
              <p className="text-muted mb-0 small">{subtitle}</p>
            )}
            {trend && trend !== 0 && !loading && (
              <div className="mt-2">
                {getTrendIcon(trend)}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="icon-wrapper">
              <Icon size={24} />
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
