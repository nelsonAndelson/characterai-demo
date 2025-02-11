// Simulated BigQuery table structure
interface ChatLog {
  user_message: string;
  ai_response: string;
  response_time: number;
  timestamp: string;
  error_type: string | null;
}

// In-memory storage for demo
let chatLogsTable: ChatLog[] = [];

// Simulate BigQuery query execution
export async function executeQuery(
  query: string,
  params: Record<string, any> = {}
) {
  // Simulate query latency
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 200 + 100)
  );

  // Parse the mock query and return appropriate data
  if (query.includes("AVG(response_time)")) {
    return simulateAggregateQuery("response_time");
  } else if (query.includes("COUNT(*)")) {
    return simulateCountQuery();
  } else if (query.includes("error_type")) {
    return simulateErrorDistribution();
  }

  return [];
}

// Simulate data insertion
export async function insertData(data: ChatLog[]) {
  chatLogsTable = chatLogsTable.concat(data);
  return { insertedRows: data.length };
}

// Helper functions for different query types
function simulateAggregateQuery(field: string) {
  const now = new Date();
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);

    return {
      hour: hour.toISOString(),
      value: Math.floor(Math.random() * 300) + 200, // 200-500ms
    };
  });

  return hourlyData;
}

function simulateCountQuery() {
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    count: Math.floor(Math.random() * 1000) + 500,
  }));
}

function simulateErrorDistribution() {
  return [
    {
      error_type: "Content Filter",
      count: Math.floor(Math.random() * 50) + 30,
    },
    { error_type: "Token Limit", count: Math.floor(Math.random() * 40) + 20 },
    {
      error_type: "Moderation Flag",
      count: Math.floor(Math.random() * 30) + 10,
    },
    {
      error_type: "Restricted Content",
      count: Math.floor(Math.random() * 20) + 5,
    },
  ];
}

// Export types for TypeScript support
export type { ChatLog };
