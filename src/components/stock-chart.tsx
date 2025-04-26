"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { motion } from "framer-motion"
import { StockHistoricalData } from "@/lib/api"
import { Card } from "@/components/ui/card"

interface StockChartProps {
  data: StockHistoricalData[]
  symbol: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <motion.div 
        className="custom-tooltip bg-background border border-border p-3 rounded shadow-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <p className="font-medium">{label}</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-sm">
          <p className="text-muted-foreground">Open:</p>
          <p className="text-right font-medium">${data.open.toFixed(2)}</p>
          <p className="text-muted-foreground">Close:</p>
          <p className="text-right font-medium">${data.close.toFixed(2)}</p>
          <p className="text-muted-foreground">High:</p>
          <p className="text-right font-medium">${data.high.toFixed(2)}</p>
          <p className="text-muted-foreground">Low:</p>
          <p className="text-right font-medium">${data.low.toFixed(2)}</p>
          <p className="text-muted-foreground">Volume:</p>
          <p className="text-right font-medium">{data.volume.toLocaleString()}</p>
        </div>
      </motion.div>
    )
  }
  return null
}

export function StockChart({ data, symbol }: StockChartProps) {
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return []
    return [...data].map((item) => ({
      ...item,
      dateFormatted: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
  }, [data])

  const minValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    const minLow = Math.min(...data.map((item) => item.low))
    // Return 5% lower for padding
    return minLow * 0.95
  }, [data])

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    const maxHigh = Math.max(...data.map((item) => item.high))
    // Return 5% higher for padding
    return maxHigh * 1.05
  }, [data])

  // Determine if the stock trend is positive or negative
  const isPositiveTrend = useMemo(() => {
    if (!data || data.length < 2) return true
    const firstClose = data[0].close
    const lastClose = data[data.length - 1].close
    return lastClose >= firstClose
  }, [data])

  // Pick a color based on the trend
  const trendColor = isPositiveTrend ? "rgba(16, 185, 129, 1)" : "rgba(239, 68, 68, 1)"
  const trendColorArea = isPositiveTrend
    ? "rgba(16, 185, 129, 0.2)"
    : "rgba(239, 68, 68, 0.2)"

  // Chart animation variants
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chartVariants}
      >
        <Card className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No historical data available for {symbol}</p>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      <Card className="p-0 sm:p-4 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="dateFormatted"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={[minValue, maxValue]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="close"
                stroke={trendColor}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 1,
                  stroke: "var(--background)",
                  fill: trendColor,
                }}
                fill="url(#colorUv)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
} 