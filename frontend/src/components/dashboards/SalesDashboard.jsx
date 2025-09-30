import React, { useState, useEffect } from 'react';
import BaseDashboard from './BaseDashboard';
import { 
  MetricCard, 
  MetricsGrid, 
  ProgressCard, 
  StatsList, 
  RecentItems 
} from './MetricComponents';
import { getSalesDashboard } from '../../services/dashboard';

const SalesDashboard = ({ userRole }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSalesDashboard();
        setData(response);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching sales dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error al cargar el dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const title = userRole === 'jefa_comercial' 
    ? 'Dashboard Jefa Comercial' 
    : 'Dashboard Vendedor';

  return (
    <BaseDashboard 
      title={title} 
      alerts={data?.salesAlerts || []} 
      loading={loading}
    >
      {data && (
        <>
          {/* Métricas principales */}
          <div className="dashboard-section">
            <h2>Métricas Principales</h2>
            <MetricsGrid columns={4}>
              <MetricCard
                title="Revenue Total"
                value={data.individualMetrics.revenue}
                icon="💰"
                color="green"
              />
              <MetricCard
                title="Cotizaciones Generadas"
                value={data.individualMetrics.quotesGenerated}
                icon="📋"
                color="blue"
              />
              <MetricCard
                title="Deals Ganados"
                value={data.individualMetrics.dealsWon}
                icon="🎯"
                color="green"
              />
              <MetricCard
                title="Tasa de Conversión"
                value={`${data.individualMetrics.winRate.toFixed(1)}%`}
                icon="📈"
                color="purple"
              />
            </MetricsGrid>
          </div>

          {/* Embudo de ventas */}
          <div className="dashboard-section">
            <h2>Embudo de Ventas</h2>
            <div className="sales-funnel">
              <div className="funnel-stage">
                <div className="funnel-value">{data.salesFunnel.leads}</div>
                <div className="funnel-label">Leads</div>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-stage">
                <div className="funnel-value">{data.salesFunnel.prospects}</div>
                <div className="funnel-label">Prospectos</div>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-stage">
                <div className="funnel-value">{data.salesFunnel.proposals}</div>
                <div className="funnel-label">Propuestas</div>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-stage">
                <div className="funnel-value">{data.salesFunnel.closedWon}</div>
                <div className="funnel-label">Cerrados</div>
              </div>
            </div>
          </div>

          {/* Objetivo mensual */}
          <div className="dashboard-section">
            <h2>Objetivo Mensual</h2>
            <ProgressCard
              title="Revenue Mensual"
              current={data.targets.currentProgress}
              target={data.targets.monthlyTarget}
              unit="$"
              color="blue"
            />
            <div className="target-details">
              <span>Días restantes: {data.targets.daysLeft}</span>
              <span>Progreso: {data.targets.progressPercentage.toFixed(1)}%</span>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Actividad reciente */}
            <div className="dashboard-column">
              <RecentItems
                title="Cotizaciones Recientes"
                items={data.recentActivity.quotes}
                renderItem={(quote) => (
                  <div className="quote-item">
                    <div className="quote-header">
                      <span className="quote-number">{quote.quote_number}</span>
                      <span className={`quote-status status-${quote.status}`}>
                        {quote.status}
                      </span>
                    </div>
                    <div className="quote-details">
                      <span className="quote-company">{quote.company_name}</span>
                      <span className="quote-amount">${quote.total_amount?.toLocaleString()}</span>
                    </div>
                    <div className="quote-date">
                      {new Date(quote.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Top clientes */}
            <div className="dashboard-column">
              <StatsList
                title="Top Clientes por Revenue"
                items={data.clientMetrics.topClients}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
            </div>
          </div>

          {/* Rendimiento del equipo - Solo para jefa comercial */}
          {userRole === 'jefa_comercial' && data.salesTeamPerformance.length > 0 && (
            <div className="dashboard-section">
              <h2>Rendimiento del Equipo</h2>
              <div className="team-performance-grid">
                {data.salesTeamPerformance.map((member) => (
                  <div key={member.id} className="team-member-card">
                    <h4 className="member-name">{member.name}</h4>
                    <div className="member-metrics">
                      <div className="member-metric">
                        <span className="metric-label">Revenue</span>
                        <span className="metric-value">${member.revenue.toLocaleString()}</span>
                      </div>
                      <div className="member-metric">
                        <span className="metric-label">Deals</span>
                        <span className="metric-value">{member.wonDeals}</span>
                      </div>
                      <div className="member-metric">
                        <span className="metric-label">Win Rate</span>
                        <span className="metric-value">{member.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métricas de conversión */}
          <div className="dashboard-section">
            <h2>Métricas de Conversión</h2>
            <MetricsGrid columns={4}>
              <MetricCard
                title="Lead a Prospecto"
                value={`${data.conversionMetrics.leadToProspect.toFixed(1)}%`}
                icon="🔄"
                color="blue"
              />
              <MetricCard
                title="Prospecto a Propuesta"
                value={`${data.conversionMetrics.prospectToProposal.toFixed(1)}%`}
                icon="📄"
                color="yellow"
              />
              <MetricCard
                title="Propuesta a Cierre"
                value={`${data.conversionMetrics.proposalToClose.toFixed(1)}%`}
                icon="✅"
                color="green"
              />
              <MetricCard
                title="Conversión General"
                value={`${data.conversionMetrics.overallConversion.toFixed(1)}%`}
                icon="🎯"
                color="purple"
              />
            </MetricsGrid>
          </div>
        </>
      )}
    </BaseDashboard>
  );
};

export default SalesDashboard;