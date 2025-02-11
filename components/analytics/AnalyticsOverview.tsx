"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from "./MetricCard";
import ErrorDistributionChart from "./ErrorDistributionChart";
import ResponseTimeChart from "./ResponseTimeChart";

const timeRanges = ["24h", "7d", "30d"];

interface ResponseTimeTrend {
  hour: string;
  avgResponseTime: number;
  requestCount: number;
}

interface AnalyticsData {
  metrics: {
    avgResponseTime: number;
    totalRequests: number;
    totalErrors: number;
    errorDistribution: Record<string, number>;
    responseTrends: ResponseTimeTrend[];
  };
}

export default function AnalyticsOverview() {
  const [timeRange, setTimeRange] = useState("24h");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.metrics) {
          throw new Error("Invalid response format: missing metrics data");
        }

        // Validate the response data structure
        if (
          typeof result.metrics.avgResponseTime !== "number" ||
          typeof result.metrics.totalRequests !== "number" ||
          typeof result.metrics.totalErrors !== "number" ||
          !Array.isArray(result.metrics.responseTrends) ||
          typeof result.metrics.errorDistribution !== "object"
        ) {
          throw new Error("Invalid response data structure");
        }

        setData(result);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-red-500">
        Error: {error}
      </div>
    );
  }

  // Calculate trends for metric cards
  const calculateTrend = (
    metric: "avgResponseTime" | "totalRequests" | "totalErrors"
  ) => {
    if (
      !data?.metrics.responseTrends ||
      data.metrics.responseTrends.length < 2
    ) {
      return 0;
    }

    if (metric === "avgResponseTime") {
      const trends = data.metrics.responseTrends;
      const recent = trends[trends.length - 1].avgResponseTime;
      const previous = trends[trends.length - 2].avgResponseTime;
      return previous === 0 ? 0 : ((recent - previous) / previous) * 100;
    }

    // For requests and errors, compare the last hour with the previous hour
    const trends = data.metrics.responseTrends;
    const recent = trends[trends.length - 1].requestCount;
    const previous = trends[trends.length - 2].requestCount;
    return previous === 0 ? 0 : ((recent - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          {timeRanges.map((range) => (
            <TabsTrigger key={range} value={range}>
              Last {range}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Average Response Time"
          value={`${Math.round(data?.metrics.avgResponseTime || 0)} ms`}
          trend={calculateTrend("avgResponseTime")}
        />
        <MetricCard
          title="Total Requests"
          value={data?.metrics.totalRequests.toLocaleString() || "0"}
          trend={calculateTrend("totalRequests")}
        />
        <MetricCard
          title="Total Errors"
          value={data?.metrics.totalErrors.toLocaleString() || "0"}
          trend={calculateTrend("totalErrors")}
          trendDirection="down"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorDistributionChart data={data?.metrics.errorDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart data={data?.metrics.responseTrends} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
