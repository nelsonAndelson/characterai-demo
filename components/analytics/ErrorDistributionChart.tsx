"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ErrorDistributionChartProps {
  data?: Record<string, number>;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

export default function ErrorDistributionChart({
  data,
}: ErrorDistributionChartProps) {
  if (!data) {
    return <div>No error data available</div>;
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
