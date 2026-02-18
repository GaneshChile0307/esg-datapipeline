'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface EmissionsData {
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
}

interface EmissionsChartProps {
  data: EmissionsData | null;
}

export default function EmissionsChart({ data }: EmissionsChartProps) {
  if (!data) {
    return (
      <div className="w-full p-8 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Emissions Overview</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available. Please save ESG data first.
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [
    {
      name: 'Scope 1',
      value: data.scope1_tco2e,
      fill: '#ef4444', // red
    },
    {
      name: 'Scope 2',
      value: data.scope2_tco2e,
      fill: '#f97316', // orange
    },
  ];

  // Add Scope 3 if it exists and is greater than 0
  if (data.scope3_tco2e && data.scope3_tco2e > 0) {
    chartData.push({
      name: 'Scope 3',
      value: data.scope3_tco2e,
      fill: '#eab308', // yellow
    });
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Emissions Overview</h3>
      
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Scope 1</p>
          <p className="text-lg font-bold text-red-600">{data.scope1_tco2e.toFixed(2)} tCO₂e</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Scope 2</p>
          <p className="text-lg font-bold text-orange-600">{data.scope2_tco2e.toFixed(2)} tCO₂e</p>
        </div>
        {data.scope3_tco2e && data.scope3_tco2e > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Scope 3</p>
            <p className="text-lg font-bold text-yellow-600">{data.scope3_tco2e.toFixed(2)} tCO₂e</p>
          </div>
        )}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-lg font-bold text-blue-600">{total.toFixed(2)} tCO₂e</p>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Emissions (tCO₂e)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)} tCO₂e`, 'Emissions'] : ['N/A', 'Emissions']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Bar dataKey="value" name="Emissions (tCO₂e)" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Chart updates automatically when you save new data
      </p>
    </div>
  );
}
