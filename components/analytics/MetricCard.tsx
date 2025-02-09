import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  trend: number
  trendDirection?: "up" | "down"
}

export default function MetricCard({ title, value, trend, trendDirection = "up" }: MetricCardProps) {
  const trendColor = trendDirection === "up" ? "text-green-500" : "text-red-500"
  const TrendIcon = trendDirection === "up" ? ArrowUpIcon : ArrowDownIcon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendColor}`}>
          {trend > 0 ? "+" : ""}
          {trend}%
        </p>
      </CardContent>
    </Card>
  )
}

