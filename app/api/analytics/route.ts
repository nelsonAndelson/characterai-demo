import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { BigQuery } from "@google-cloud/bigquery";
import { getExperiment, logEvent } from "@/lib/statsig-simulation";
import {
  simulateSlowResponse,
  simulateRandomError,
} from "@/lib/error-simulation";
import * as fs from "fs";
import { BATCH_FILE, loadBatchToBigQuery } from "./loadBatch";

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// For demo purposes, we'll use a reference date in 2024
const REFERENCE_DATE = new Date("2024-02-09T08:45:00+00:00");

export async function GET(request: Request) {
  const transaction = {
    name: "analytics-api",
    status: "ok" as "ok" | "error",
    setStatus(status: "ok" | "error") {
      this.status = status;
    },
    finish() {
      console.log(
        `Transaction ${this.name} finished with status: ${this.status}`
      );
    },
  };

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "24h";

    // Convert timeRange to proper BigQuery interval format
    const timeRangeValue = timeRange
      .replace("h", " HOUR")
      .replace("d", " DAY")
      .replace("w", " WEEK");

    // Run all queries in parallel for better performance
    const [avgResponseTime, totalRequests, errorDist, responseTrends] =
      await Promise.all([
        // Average response time
        bigquery.query({
          query: `
      SELECT AVG(response_time) as value
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRangeValue})
        `,
        }),

        // Total requests
        bigquery.query({
          query: `
          SELECT COUNT(*) as value
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRangeValue})
      `,
        }),

        // Error distribution
        bigquery.query({
          query: `
          SELECT 
            COALESCE(error_type, 'Unknown') as error_type,
            COUNT(*) as count
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRangeValue})
          GROUP BY error_type
      `,
        }),

        // Response time trends (hourly average)
        bigquery.query({
          query: `
        SELECT 
          TIMESTAMP_TRUNC(timestamp, HOUR) as hour,
            AVG(response_time) as avgResponseTime,
            COUNT(*) as requestCount
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRangeValue})
        GROUP BY hour
          ORDER BY hour ASC
        `,
        }),
      ]);

    // Process error distribution data
    const errorDistribution = errorDist[0].reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.error_type] = row.count;
        return acc;
      },
      {}
    );

    // Calculate total errors
    const totalErrors = Object.values(errorDistribution).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    // Format response time trends
    const formattedTrends = responseTrends[0].map((row: any) => ({
      hour: row.hour.value, // Access the timestamp value property
      avgResponseTime: Math.round(row.avgResponseTime),
      requestCount: row.requestCount,
    }));

    // Structure the response
    const response = {
      metrics: {
        avgResponseTime: Math.round(avgResponseTime[0][0]?.value || 0),
        totalRequests: totalRequests[0][0]?.value || 0,
        totalErrors,
        errorDistribution,
        responseTrends: formattedTrends,
      },
    };

    transaction.setStatus("ok");
    return Response.json(response);
  } catch (error) {
    transaction.setStatus("error");
    console.error("Analytics API Error:", error);

    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: {
          api: "analytics",
        },
      });
    }

    return Response.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  } finally {
    transaction.finish();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_message, ai_response, response_time, error_type } = body;

    // Prepare record
    const record = {
      user_message,
      ai_response,
      response_time,
      timestamp: new Date().toISOString(),
      error_type: error_type || null,
    };

    // Append to batch file
    fs.appendFileSync(BATCH_FILE, JSON.stringify(record) + "\n");

    // Force immediate batch load for testing
    try {
      await loadBatchToBigQuery();
      console.log("Forced batch load completed");
    } catch (loadError) {
      console.error("Error during forced batch load:", loadError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing analytics data:", error);
    Sentry.captureException(error, {
      tags: { api: "analytics-insert" },
    });
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process analytics data",
      },
      { status: 500 }
    );
  }
}
