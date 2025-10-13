import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const SalesBarChart = ({ data, sortBy, goalData }) => {
  console.log('SalesBarChart recibió:', { data, sortBy, goalData });
  const chartRef = useRef(null);
  
  // Cleanup del gráfico cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  // Calcular la meta para mostrar en el gráfico
  const goalValue = goalData?.goal_quantity || 0;
  
  const chartData = {
    labels: data.slice(0, 10).map(vendedor => vendedor.name),
    datasets: [
      {
        label: sortBy === 'total_sales' ? 'Ventas' :
               sortBy === 'total_projects' ? 'Proyectos' :
               sortBy === 'total_quotes' ? 'Cotizaciones' :
               'Tasa de Aprobación',
        data: data.slice(0, 10).map(vendedor => {
          switch (sortBy) {
            case 'total_sales':
              return vendedor.total_sales || 0;
            case 'total_projects':
              return vendedor.total_projects || 0;
            case 'total_quotes':
              return vendedor.total_quotes || 0;
            case 'approval_rate':
              return vendedor.approval_rate || 0;
            default:
              return vendedor.total_quotes || 0;
          }
        }),
        backgroundColor: 'rgba(33, 150, 243, 0.8)',
        borderColor: '#2196F3',
        borderWidth: 1,
        type: 'bar',
        order: 2,
        barThickness: 20,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      },
      // Meta como línea de referencia
      ...(goalValue > 0 ? [{
        label: 'Meta',
        data: new Array(Math.min(data.length, 10)).fill(goalValue),
        backgroundColor: 'rgba(255, 87, 34, 0.1)',
        borderColor: '#FF5722',
        borderWidth: 2,
        type: 'line',
        order: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0
      }] : [])
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: `Top 10 Vendedores - ${sortBy === 'total_sales' ? 'Ventas' :
               sortBy === 'total_projects' ? 'Proyectos' :
               sortBy === 'total_quotes' ? 'Cotizaciones' :
               'Tasa de Aprobación'}${goalData?.goal_quantity ? ` (Meta: ${goalData.goal_quantity})` : ''}`,
        font: {
          size: 14,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          },
          callback: function(value) {
            if (sortBy === 'total_sales') {
              return 'S/ ' + value.toLocaleString('es-PE');
            }
            return value;
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 9
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
  };

  return (
    <div className="h-100">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export const SalesDistributionChart = ({ stats }) => {
  const chartRef = useRef(null);
  
  // Cleanup del gráfico cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);
  
  if (!stats) {
    return (
      <div className="text-center py-4 text-muted">
        No hay datos de distribución disponibles
      </div>
    );
  }

  const chartData = {
    labels: ['Top 3 Vendedores', 'Resto del Equipo'],
    datasets: [
      {
        data: [stats.top3Sales, stats.restSales],
        backgroundColor: [
          '#FFD700', // Oro para top 3
          '#2196F3'  // Azul para resto
        ],
        borderColor: [
          '#FFD700',
          '#2196F3'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Ventas',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          }
        }
      }
    },
  };

  return (
    <div className="h-100">
      <Doughnut ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export const GoalProgressChart = ({ currentSales, goalQuantity }) => {
  console.log('GoalProgressChart recibió:', { currentSales, goalQuantity });
  const chartRef = useRef(null);
  const progressPercentage = goalQuantity > 0 ? Math.min((currentSales / goalQuantity) * 100, 100) : 0;
  
  // Cleanup del gráfico cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);
  
  const chartData = {
    labels: ['Progreso', 'Restante'],
    datasets: [
      {
        data: [progressPercentage, 100 - progressPercentage],
        backgroundColor: [
          progressPercentage >= 100 ? '#4CAF50' : '#2196F3', // Verde si meta alcanzada, azul si no
          '#E0E0E0' // Gris para lo restante
        ],
        borderColor: [
          progressPercentage >= 100 ? '#4CAF50' : '#2196F3',
          '#E0E0E0'
        ],
        borderWidth: 2,
        cutout: '70%', // Para hacer un gráfico de dona
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultar leyenda para gráfico de progreso
      },
      title: {
        display: true,
        text: 'Progreso hacia la Meta',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.label === 'Progreso') {
              return `Progreso: ${progressPercentage.toFixed(1)}%`;
            }
            return `Restante: ${(100 - progressPercentage).toFixed(1)}%`;
          }
        }
      }
    },
  };

  return (
    <div className="position-relative h-100">
      <Doughnut ref={chartRef} data={chartData} options={options} />
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <div className="fw-bold fs-5" style={{ color: progressPercentage >= 100 ? '#4CAF50' : '#2196F3' }}>
          {progressPercentage.toFixed(1)}%
        </div>
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Meta Alcanzada</small>
        <div className="mt-1">
          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
            {currentSales} / {goalQuantity} ventas
          </small>
        </div>
      </div>
    </div>
  );
};
