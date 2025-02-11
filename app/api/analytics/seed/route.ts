import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

// Define possible error types for realistic scenarios
const ERROR_TYPES = {
  NULL: null, // Success case
  RATE_LIMIT: "RATE_LIMIT_EXCEEDED",
  VALIDATION: "INPUT_VALIDATION_ERROR",
  AUTH: "AUTHENTICATION_ERROR",
  TIMEOUT: "REQUEST_TIMEOUT",
  SERVER: "INTERNAL_SERVER_ERROR",
  MODEL: "MODEL_ERROR",
} as const;

type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

// Weighted distribution for error types (out of 100)
const ERROR_DISTRIBUTION: Record<string, number> = {
  null: 80, // 80% success rate
  RATE_LIMIT_EXCEEDED: 5,
  INPUT_VALIDATION_ERROR: 5,
  AUTHENTICATION_ERROR: 3,
  REQUEST_TIMEOUT: 3,
  INTERNAL_SERVER_ERROR: 2,
  MODEL_ERROR: 2,
};

function getRandomErrorType(): ErrorType {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const [errorType, weight] of Object.entries(ERROR_DISTRIBUTION)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return (errorType === "null" ? null : errorType) as ErrorType;
    }
  }

  return null;
}

function generateRandomResponseTime(hasError: boolean): number {
  // Base response time between 100ms and 800ms
  let baseTime = Math.floor(Math.random() * 700) + 100;

  // If there's an error, potentially add more latency
  if (hasError) {
    // 50% chance of increased latency for error cases
    if (Math.random() > 0.5) {
      baseTime += Math.floor(Math.random() * 1000); // Add up to 1s for errors
    }
  }

  return baseTime;
}

function generateTestData() {
  const rows = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const errorType = getRandomErrorType();
    const hasError = errorType !== null;
    const timestamp = new Date(
      now.getTime() - Math.random() * 24 * 60 * 60 * 1000
    );

    rows.push({
      user_message: `Test message ${i + 1}`,
      ai_response: hasError ? "Error occurred" : `Test response ${i + 1}`,
      response_time: generateRandomResponseTime(hasError),
      timestamp: timestamp.toISOString(),
      error_type: errorType,
    });
  }

  return rows.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

async function recreateTableWithData() {
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error("Missing GOOGLE_CLOUD_PROJECT_ID environment variable");
  }

  const rows = generateTestData();
  const formattedRows = rows.map((row) => [
    row.user_message,
    row.ai_response,
    row.response_time,
    row.timestamp,
    row.error_type,
  ]);

  const [job] = await bigquery.createQueryJob({
    query: `
      CREATE OR REPLACE TABLE \`${
        process.env.GOOGLE_CLOUD_PROJECT_ID
      }.characterai_analytics.chat_logs\`
      (
        user_message STRING,
        ai_response STRING,
        response_time INT64,
        timestamp TIMESTAMP,
        error_type STRING
      )
      AS
      SELECT *
      FROM UNNEST([
        STRUCT<
          user_message STRING,
          ai_response STRING,
          response_time INT64,
          timestamp TIMESTAMP,
          error_type STRING
        >${formattedRows
          .map(
            (row) => `(
          '${row[0].replace(/'/g, "''")}',
          '${row[1].replace(/'/g, "''")}',
          ${row[2]},
          TIMESTAMP('${row[3]}'),
          ${row[4] === null ? "NULL" : `'${row[4]}'`}
        )`
          )
          .join(",")}
      ])
    `,
  });

  await job.getQueryResults();
}

export async function POST() {
  try {
    await recreateTableWithData();
    return Response.json({ success: true });
  } catch (error) {
    // In production, you might want to log to a proper logging service
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
