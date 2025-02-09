"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from "./MetricCard";
import ErrorDistributionChart from "./ErrorDistributionChart";
import ResponseTimeChart from "./ResponseTimeChart";

const timeRanges = ["24h", "7d", "30d"];

interface AnalyticsData {
  metrics: {
    avgResponseTime: number;
    totalRequests: number;
    totalErrors: number;
    errorDistribution: Record<string, number>;
    responseTrends: Array<{ hour: number; avgResponseTime: number }>;
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
      console.log("Fetching analytics for timeRange:", timeRange);

      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        console.log("API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received analytics data:", data);

        if (!data.metrics) {
          throw new Error("Response missing metrics data");
        }

        setData(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading analytics...
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
          trend={5}
        />
        <MetricCard
          title="Total Requests"
          value={data?.metrics.totalRequests.toLocaleString() || "0"}
          trend={12}
        />
        <MetricCard
          title="Total Errors"
          value={data?.metrics.totalErrors.toLocaleString() || "0"}
          trend={-8}
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
