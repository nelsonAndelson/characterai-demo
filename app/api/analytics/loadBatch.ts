import { BigQuery } from "@google-cloud/bigquery";
import * as fs from "fs";
import * as path from "path";
import * as Sentry from "@sentry/nextjs";

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

// Batch processing configuration
const BATCH_FILE = path.join(process.cwd(), "tmp", "analytics_batch.jsonl");
const BATCH_DIR = path.join(process.cwd(), "tmp");

// Ensure tmp directory exists
if (!fs.existsSync(BATCH_DIR)) {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
}

// Function to load batch data into BigQuery
export async function loadBatchToBigQuery() {
  try {
    if (!fs.existsSync(BATCH_FILE)) {
      console.log("No batch file exists to load");
      return; // No data to load
    }

    // Log the contents of the batch file for debugging
    console.log("Batch file contents:", fs.readFileSync(BATCH_FILE, "utf8"));

    const metadata = {
      sourceFormat: "NEWLINE_DELIMITED_JSON",
      schema: {
        fields: [
          { name: "user_message", type: "STRING" },
          { name: "ai_response", type: "STRING" },
          { name: "response_time", type: "INTEGER" },
          { name: "timestamp", type: "TIMESTAMP" },
          { name: "error_type", type: "STRING" },
        ],
      },
      location: "US",
      writeDisposition: "WRITE_APPEND",
    };

    // Ensure dataset exists
    const dataset = bigquery.dataset("characterai_analytics");
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      console.log("Creating dataset characterai_analytics");
      await dataset.create();
    }

    // Ensure table exists
    const table = dataset.table("chat_logs");
    const [tableExists] = await table.exists();
    if (!tableExists) {
      console.log("Creating table chat_logs");
      await table.create({ schema: metadata.schema });
    }

    // Load data into BigQuery
    console.log("Starting BigQuery load job");
    const [job] = await table.load(BATCH_FILE, metadata);

    // Check the job's status
    const errors = job.status?.errors;
    if (errors && errors.length > 0) {
      console.error("BigQuery load job failed:", JSON.stringify(errors));
      throw new Error(`BigQuery load job failed: ${JSON.stringify(errors)}`);
    }

    // Clear the batch file after successful load
    fs.unlinkSync(BATCH_FILE);
    console.log("Successfully loaded batch data into BigQuery");
  } catch (error) {
    console.error("Error loading batch to BigQuery:", error);
    Sentry.captureException(error, {
      tags: { process: "batch-load" },
    });
    throw error; // Re-throw to handle in the route
  }
}

export { BATCH_FILE };
