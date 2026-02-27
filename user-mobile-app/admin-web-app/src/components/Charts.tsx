import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data: number[];
  labels: string[];
  title?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, labels, title = 'Sales Trend' }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#6b7280',
              },
              grid: {
                color: '#e5e7eb',
              },
            },
            x: {
              ticks: {
                color: '#6b7280',
              },
              grid: {
                color: '#e5e7eb',
              },
            },
          },
        }}
      />
    </div>
  );
};

interface RevenueChartProps {
  data: number[];
  labels: string[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, labels, title = 'Revenue' }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data,
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#6b7280',
                callback: (value) => `$${value}`,
              },
              grid: {
                color: '#e5e7eb',
              },
            },
            x: {
              ticks: {
                color: '#6b7280',
              },
              grid: {
                color: '#e5e7eb',
              },
            },
          },
        }}
      />
    </div>
  );
};

interface OrderStatusChartProps {
  data: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  title?: string;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data, title = 'Order Status Distribution' }) => {
  const chartData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [data.pending, data.processing, data.shipped, data.delivered, data.cancelled],
        backgroundColor: [
          '#fbbf24', // yellow
          '#60a5fa', // blue
          '#a78bfa', // purple
          '#10b981', // green
          '#ef4444', // red
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ position: 'relative', height: '300px' }}>
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#6b7280',
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
