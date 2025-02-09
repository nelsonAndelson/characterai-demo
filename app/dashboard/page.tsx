import ChatLogsTable from "@/components/ChatLogsTable"

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">AI Chat Logs</h1>
      <ChatLogsTable />
    </div>
  )
}

