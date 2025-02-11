"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utility function for safe date formatting
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "N/A";

  try {
    // Debug log to see the exact format we're receiving
    console.log("Raw timestamp:", timestamp, "Type:", typeof timestamp);

    // Extract the timestamp value if it's an object
    const timestampStr =
      typeof timestamp === "object" && timestamp !== null
        ? timestamp.value
        : timestamp;

    // Try parsing as ISO string
    const date = new Date(timestampStr);

    if (isNaN(date.getTime())) {
      console.warn(`Invalid timestamp received:`, {
        original: timestamp,
        extracted: timestampStr,
        type: typeof timestampStr,
      });
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(date);
  } catch (error) {
    console.error(`Error formatting timestamp:`, {
      timestamp,
      error,
      type: typeof timestamp,
    });
    return "Invalid Date";
  }
}

interface ChatLog {
  user_message: string;
  ai_response: string;
  response_time: number;
  timestamp: string;
  error_type: string | null;
}

export default function ChatLogsTable() {
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/bigquery?type=recent&limit=50");

        if (!response.ok) {
          throw new Error("Failed to fetch chat logs");
        }

        const result = await response.json();
        if (result.data) {
          // Add debug logging to inspect the data
          console.log("Received logs:", result.data);
          console.log("Sample timestamp:", result.data[0]?.timestamp);
          setLogs(result.data);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch chat logs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Set up polling for updates every 30 seconds
    const interval = setInterval(fetchLogs, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-muted-foreground">Loading chat logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Message</TableHead>
            <TableHead>AI Response</TableHead>
            <TableHead>Response Time (ms)</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Error Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow
              key={index}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedLog(log)}
            >
              <TableCell className="font-medium">{log.user_message}</TableCell>
              <TableCell>{log.ai_response}</TableCell>
              <TableCell>{log.response_time}</TableCell>
              <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
              <TableCell>{log.error_type || "None"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detailed Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">User Message</h3>
              <p>{selectedLog?.user_message}</p>
            </div>
            <div>
              <h3 className="font-semibold">AI Response</h3>
              <p>{selectedLog?.ai_response}</p>
            </div>
            <div>
              <h3 className="font-semibold">Response Time</h3>
              <p>{selectedLog?.response_time} ms</p>
            </div>
            <div>
              <h3 className="font-semibold">Timestamp</h3>
              <p>{formatTimestamp(selectedLog?.timestamp)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Error Type</h3>
              <p>{selectedLog?.error_type || "None"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
