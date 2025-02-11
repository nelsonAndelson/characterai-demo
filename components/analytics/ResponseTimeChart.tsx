"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

interface ResponseTimeTrend {
  hour: string;
  avgResponseTime: number;
  requestCount: number;
}

interface ResponseTimeChartProps {
  data?: ResponseTimeTrend[];
}

export default function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No response time data available
      </div>
    );
  }

  const formattedData = data.map((item) => {
    const timestamp = new Date(item.hour);
    return {
      hour: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      avgResponseTime: Math.round(item.avgResponseTime),
      requestCount: item.requestCount,
    };
  });

  const minResponse =
    Math.floor(Math.min(...data.map((d) => d.avgResponseTime)) / 50) * 50;
  const maxResponse =
    Math.ceil(Math.max(...data.map((d) => d.avgResponseTime)) / 50) * 50;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis
            dataKey="hour"
            label={{
              value: "Time",
              position: "insideBottom",
              offset: -5,
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[minResponse, maxResponse]}
            ticks={Array.from(
              { length: 6 },
              (_, i) => minResponse + ((maxResponse - minResponse) / 5) * i
            )}
            label={{
              value: "Response Time (ms)",
              angle: -90,
              position: "insideLeft",
              offset: 15,
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${Math.round(value)} ms`,
              name === "requestCount"
                ? "Request Count"
                : "Average Response Time",
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line
            name="Average Response Time"
            type="monotone"
            dataKey="avgResponseTime"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: "#82ca9d",
              strokeWidth: 1,
            }}
            activeDot={{
              r: 6,
              stroke: "#82ca9d",
              strokeWidth: 2,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            dataKey="requestCount"
            label={{
              value: "Request Count",
              angle: 90,
              position: "insideRight",
              offset: 15,
            }}
            tick={{ fontSize: 12 }}
          />
          <Line
            name="Request Count"
            type="monotone"
            dataKey="requestCount"
            stroke="#8884d8"
            strokeDasharray="3 3"
            yAxisId="right"
            dot={{
              r: 3,
              fill: "#8884d8",
              strokeWidth: 1,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
