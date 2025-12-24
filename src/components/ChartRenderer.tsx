import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

interface ChartRendererProps {
  chartData: any;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  const renderChart = () => {
    const chartType = chartData.chart_type;

    // Transform data for line, area, bar charts if needed
    const transformArrayData = () => {
      if (Array.isArray(chartData.x_axis) && Array.isArray(chartData.y_axis)) {
        return chartData.x_axis.map((xVal: any, idx: number) => ({
          x: xVal,
          y: chartData.y_axis[idx]
        }));
      }
      return chartData.data;
    };

    // Line Chart
    if (chartType === 'line') {
      const data = transformArrayData();
      const xKey = Array.isArray(chartData.x_axis) ? 'x' : chartData.x_axis;
      const yKey = Array.isArray(chartData.y_axis) ? 'y' : chartData.y_axis;

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Area Chart
    if (chartType === 'area') {
      const data = transformArrayData();
      const xKey = Array.isArray(chartData.x_axis) ? 'x' : chartData.x_axis;
      const yKey = Array.isArray(chartData.y_axis) ? 'y' : chartData.y_axis;

      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Bar Chart
    if (chartType === 'bar') {
      const data = transformArrayData();
      const xKey = Array.isArray(chartData.x_axis) ? 'x' : chartData.x_axis;
      const yKey = Array.isArray(chartData.y_axis) ? 'y' : chartData.y_axis;

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Horizontal Bar Chart
    if (chartType === 'horizontal_bar') {
      const data = chartData.y_axis.map((label: string, idx: number) => ({
        label: label,
        value: chartData.x_axis[idx]
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: chartData.x_label || 'Value', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="label" label={{ value: chartData.y_label || 'Category', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Pie Chart
    if (chartType === 'pie') {
      const data = chartData.labels.map((label: string, idx: number) => ({
        name: label,
        value: chartData.values[idx]
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Doughnut Chart (Pie with inner radius)
    if (chartType === 'doughnut') {
      const data = chartData.labels.map((label: string, idx: number) => ({
        name: label,
        value: chartData.values[idx]
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Scatter Chart
    if (chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name={chartData.x_label || 'X'} label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis type="number" dataKey="y" name={chartData.y_label || 'Y'} label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data Points" data={chartData.data_points} fill={COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    // Multi-Line Chart
    if (chartType === 'multi_line') {
      const data = chartData.x_axis.map((xVal: any, idx: number) => {
        const point: any = { x: xVal };
        chartData.datasets.forEach((dataset: any) => {
          point[dataset.label] = dataset.data[idx];
        });
        return point;
      });

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset: any, idx: number) => (
              <Line key={dataset.label} type="monotone" dataKey={dataset.label} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Stacked Bar Chart
    if (chartType === 'stacked_bar') {
      const data = chartData.x_axis.map((xVal: any, idx: number) => {
        const point: any = { x: xVal };
        chartData.datasets.forEach((dataset: any) => {
          point[dataset.label] = dataset.data[idx];
        });
        return point;
      });

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" label={{ value: chartData.x_label || 'X', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: chartData.y_label || 'Y', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {chartData.datasets.map((dataset: any, idx: number) => (
              <Bar key={dataset.label} dataKey={dataset.label} stackId="a" fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Table
    if (chartType === 'table') {
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                {chartData.columns.map((col: string, idx: number) => (
                  <th key={idx} style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.rows.map((row: any[], rowIdx: number) => (
                <tr key={rowIdx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {row.map((cell: any, cellIdx: number) => (
                    <td key={cellIdx} style={{ padding: '12px', color: '#1f2937' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div>Unsupported chart type: {chartType}</div>;
  };

  return (
    <div className="dify-chart-container">
      <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>{chartData.title || 'Chart'}</h4>
      {renderChart()}
    </div>
  );
};

export default ChartRenderer;
