import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const datasetId = process.env.BIGQUERY_DATASET_ID || "characterai_analytics";
const tableId = "chat_logs";

// Create dataset and table if they don't exist
export async function initializeBigQuery() {
  try {
    // Create dataset if it doesn't exist
    const [datasets] = await bigquery.getDatasets();
    const datasetExists = datasets.some((d) => d.id === datasetId);

    if (!datasetExists) {
      await bigquery.createDataset(datasetId);
      console.log(`Dataset ${datasetId} created.`);
    }

    // Create table if it doesn't exist
    const dataset = bigquery.dataset(datasetId);
    const [tables] = await dataset.getTables();
    const tableExists = tables.some((t) => t.id === tableId);

    if (!tableExists) {
      const schema = [
        { name: "user_message", type: "STRING" },
        { name: "ai_response", type: "STRING" },
        { name: "response_time", type: "INTEGER" },
        { name: "timestamp", type: "TIMESTAMP" },
        { name: "error_type", type: "STRING" },
      ];

      await dataset.createTable(tableId, { schema });
      console.log(`Table ${tableId} created.`);
    }
  } catch (error) {
    console.error("Error initializing BigQuery:", error);
    throw error;
  }
}

// Query execution with error handling
export async function executeQuery(
  query: string,
  params: Record<string, any> = {}
) {
  try {
    const options = {
      query,
      params,
      location: "US", // Specify the location of your dataset
    };

    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error("BigQuery query error:", error);
    throw error;
  }
}

// Insert data into BigQuery
export async function insertData(rows: any[]) {
  try {
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    const [response] = await table.insert(rows);
    return response;
  } catch (error) {
    console.error("BigQuery insert error:", error);
    throw error;
  }
}

// Export the BigQuery instance for direct access if needed
export { bigquery, datasetId, tableId };
