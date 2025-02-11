import { BigQuery, Dataset, Table } from "@google-cloud/bigquery";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function seedBigQuery() {
  try {
    // Initialize BigQuery client
    const bigquery = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      },
    });

    // Create dataset if it doesn't exist
    const datasetId =
      process.env.BIGQUERY_DATASET_ID || "characterai_analytics";
    const [datasets] = await bigquery.getDatasets();
    const datasetExists = datasets.some(
      (dataset: Dataset) => dataset.id === datasetId
    );

    if (!datasetExists) {
      await bigquery.createDataset(datasetId);
      console.log(`Dataset ${datasetId} created.`);
    }

    // Define table schema
    const schema = [
      { name: "user_message", type: "STRING" },
      { name: "ai_response", type: "STRING" },
      { name: "response_time", type: "INTEGER" },
      { name: "timestamp", type: "TIMESTAMP" },
      { name: "error_type", type: "STRING", mode: "NULLABLE" },
    ] as const;

    // Create table if it doesn't exist
    const tableId = "chat_analytics";
    const [tables] = await bigquery.dataset(datasetId).getTables();
    const tableExists = tables.some((table: Table) => table.id === tableId);

    if (!tableExists) {
      await bigquery.dataset(datasetId).createTable(tableId, { schema });
      console.log(`Table ${tableId} created.`);
    }

    // Generate mock data
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      user_message: `Test message ${i + 1}`,
      ai_response: `AI response to message ${i + 1}`,
      response_time: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      error_type: Math.random() > 0.95 ? "timeout_error" : null,
    }));

    // Insert data
    await bigquery.dataset(datasetId).table(tableId).insert(mockData);
    console.log(`Successfully inserted ${mockData.length} rows of mock data.`);
  } catch (error) {
    console.error("Error seeding BigQuery:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedBigQuery();
