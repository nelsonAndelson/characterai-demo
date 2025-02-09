import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get("timeRange") || "24h";

  console.log("Analytics API called with timeRange:", timeRange);

  const now = new Date();
  const startDate = new Date(now);

  switch (timeRange) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    default: // 24h
      startDate.setDate(now.getDate() - 1);
  }

  console.log(
    "Querying data from:",
    startDate.toISOString(),
    "to:",
    now.toISOString()
  );

  // First, let's check if we can access the table at all
  const { data: tableInfo, error: tableError } = await supabase
    .from("chat_logs")
    .select("count");

  if (tableError) {
    console.error("Error accessing chat_logs table:", tableError);
    return Response.json(
      { error: "Failed to access chat_logs table" },
      { status: 500 }
    );
  }

  console.log("Table access check result:", tableInfo);

  const { data: metrics, error: metricsError } = await supabase
    .from("chat_logs")
    .select("response_time, error_type, timestamp")
    .gte("timestamp", startDate.toISOString());

  if (metricsError) {
    console.error("Error fetching metrics:", metricsError);
    return Response.json({ error: metricsError.message }, { status: 500 });
  }

  console.log("Retrieved records count:", metrics?.length || 0);

  if (!metrics || metrics.length === 0) {
    console.log("No data found for the specified time range");
    return Response.json({
      metrics: {
        avgResponseTime: 0,
        totalRequests: 0,
        totalErrors: 0,
        errorDistribution: {},
        responseTrends: [],
      },
    });
  }

  // Calculate metrics
  const avgResponseTime =
    metrics.reduce((acc, log) => acc + log.response_time, 0) / metrics.length;
  const totalRequests = metrics.length;
  const totalErrors = metrics.filter((log) => log.error_type).length;

  console.log("Calculated metrics:", {
    avgResponseTime: Math.round(avgResponseTime),
    totalRequests,
    totalErrors,
  });

  // Calculate error distribution
  const errorDistribution = metrics.reduce((acc, log) => {
    if (log.error_type) {
      acc[log.error_type] = (acc[log.error_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("Error distribution:", errorDistribution);

  // Calculate response time trends (hourly buckets)
  const hourlyBuckets = metrics.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    if (!acc[hour]) {
      acc[hour] = { total: 0, count: 0 };
    }
    acc[hour].total += log.response_time;
    acc[hour].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  // Convert hourly buckets to array and calculate averages
  const responseTrends = Object.entries(hourlyBuckets)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgResponseTime: Math.round(data.total / data.count),
    }))
    .sort((a, b) => a.hour - b.hour);

  console.log("Response trends:", responseTrends);

  return Response.json({
    metrics: {
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests,
      totalErrors,
      errorDistribution,
      responseTrends,
    },
  });
}
