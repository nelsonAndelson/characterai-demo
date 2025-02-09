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
import { supabase } from "@/lib/supabase";

interface ChatLog {
  id: string;
  user_message: string;
  ai_response: string;
  response_time: number;
  timestamp: string;
  error_type: string | null;
}

export default function ChatLogsTable() {
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [logs, setLogs] = useState<ChatLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("chat_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      if (data) {
        setLogs(data);
      }
    };

    fetchLogs();

    // Set up real-time subscription
    const subscription = supabase
      .channel("chat_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_logs",
        },
        (payload) => {
          console.log("Change received!", payload);
          fetchLogs(); // Refetch logs when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
          {logs.map((log) => (
            <TableRow
              key={log.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedLog(log)}
            >
              <TableCell className="font-medium">{log.user_message}</TableCell>
              <TableCell>{log.ai_response}</TableCell>
              <TableCell>{log.response_time}</TableCell>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
              <p>{selectedLog?.timestamp}</p>
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
