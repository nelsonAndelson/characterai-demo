import { loadBatchToBigQuery } from "../loadBatch";

export async function POST(request: Request) {
  try {
    await loadBatchToBigQuery();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing batch:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process batch",
      },
      { status: 500 }
    );
  }
}
