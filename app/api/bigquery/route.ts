import { executeQuery, initializeBigQuery } from "@/lib/bigquery-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryType = searchParams.get("type") || "performance";
  const timeRange = searchParams.get("timeRange") || "24h";
  const limit = searchParams.get("limit") || "10";

  try {
    // Ensure BigQuery is initialized
    await initializeBigQuery();

    let query: string;

    switch (queryType) {
      case "recent":
        query = `
          SELECT *
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
          ORDER BY timestamp DESC
          LIMIT ${limit}
        `;
        break;

      case "performance":
        query = `
          SELECT 
            TIMESTAMP_TRUNC(timestamp, HOUR) as hour,
            ROUND(AVG(response_time), 2) as avg_response_time,
            COUNT(*) as requests_count
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRange})
          GROUP BY hour
          ORDER BY hour DESC
          LIMIT 24
        `;
        break;

      case "errors":
        query = `
          SELECT 
            IFNULL(error_type, 'success') as status,
            COUNT(*) as count
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRange})
          GROUP BY error_type
          ORDER BY count DESC
        `;
        break;

      case "requests":
        query = `
          SELECT 
            COUNT(*) as total_requests,
            COUNTIF(error_type IS NOT NULL) as error_count,
            ROUND(AVG(response_time), 2) as avg_response_time
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.characterai_analytics.chat_logs\`
          WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${timeRange})
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid query type" },
          { status: 400 }
        );
    }

    console.log("Executing query:", query); // Debug log
    const data = await executeQuery(query);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("BigQuery error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
