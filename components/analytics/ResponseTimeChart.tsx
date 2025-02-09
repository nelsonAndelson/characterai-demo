"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ResponseTimeChartProps {
  data?: Array<{ hour: number; avgResponseTime: number }>;
}

export default function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  if (!data) {
    return <div>No response time data available</div>;
  }

  // Format hour labels
  const formattedData = data.map((item) => ({
    ...item,
    hour: `${item.hour}:00`,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            label={{ value: "Time", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Response Time (ms)",
              angle: -90,
              position: "insideLeft",
              offset: 15,
            }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${Math.round(value)} ms`,
              "Response Time",
            ]}
          />
          <Line
            type="monotone"
            dataKey="avgResponseTime"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
