"use client"

import { useState, useEffect } from "react"
import { SiteWrapper } from "@/components/site-wrapper"
import { StockProvider } from "@/context/stock-context"
import { StockData, StockHistoricalData, getStockQuote, getHistoricalData } from "@/lib/api"
import { StockSearch } from "@/components/stock-search"
import { Button } from "@/components/ui/button"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, BarChart3, LineChart as LineChartIcon } from "lucide-react"

// Color palette for different stocks in the comparison chart
const chartColors = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088fe", // Blue
  "#ff6b6b", // Red
  "#6bd7ff", // Light blue
  "#d88884", // Light red
];

function StockComparisonManager() {
  const [comparedStocks, setComparedStocks] = useState<StockData[]>([])
  const [historicalData, setHistoricalData] = useState<{[key: string]: StockHistoricalData[]}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily")
  const [normalizeData, setNormalizeData] = useState(true)
  
  // Add a stock to the comparison
  const handleAddStock = async (symbol: string) => {
    // Check if stock is already added
    if (comparedStocks.some(s => s.symbol === symbol)) return
    
    setIsLoading(true)
    try {
      const stockData = await getStockQuote(symbol)
      if (stockData) {
        setComparedStocks(prev => [...prev, stockData])
        await fetchHistoricalData(symbol, timeframe)
      }
    } catch (error) {
      console.error(`Error adding stock ${symbol}:`, error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Remove a stock from the comparison
  const handleRemoveStock = (symbol: string) => {
    setComparedStocks(prev => prev.filter(s => s.symbol !== symbol))
    setHistoricalData(prev => {
      const newData = { ...prev }
      delete newData[symbol]
      return newData
    })
  }
  
  // Fetch historical data for a stock
  const fetchHistoricalData = async (symbol: string, interval: "daily" | "weekly" | "monthly") => {
    try {
      const data = await getHistoricalData(symbol, interval)
      setHistoricalData(prev => ({
        ...prev,
        [symbol]: data
      }))
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
    }
  }
  
  // Update all historical data when timeframe changes
  useEffect(() => {
    if (comparedStocks.length === 0) return
    
    const updateAllHistoricalData = async () => {
      setIsLoading(true)
      try {
        await Promise.all(
          comparedStocks.map(stock => 
            fetchHistoricalData(stock.symbol, timeframe)
          )
        )
      } catch (error) {
        console.error("Error updating historical data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    updateAllHistoricalData()
  }, [timeframe, comparedStocks.length])
  
  // Prepare data for the comparison chart
  const prepareChartData = () => {
    if (Object.keys(historicalData).length === 0) return []
    
    // Get the first stock's data to use as a template
    const firstSymbol = Object.keys(historicalData)[0]
    const firstStockData = historicalData[firstSymbol]
    
    if (!firstStockData || firstStockData.length === 0) return []
    
    // Get starting values for normalization
    const startingValues: {[key: string]: number} = {}
    if (normalizeData) {
      Object.keys(historicalData).forEach(symbol => {
        const data = historicalData[symbol]
        if (data && data.length > 0) {
          startingValues[symbol] = data[0].close
        }
      })
    }
    
    // Create combined data points
    return firstStockData.map((point, index) => {
      const dataPoint: any = {
        date: point.date,
      }
      
      Object.keys(historicalData).forEach((symbol) => {
        const data = historicalData[symbol]
        if (data && index < data.length) {
          if (normalizeData) {
            // Normalize to show percentage change
            const startValue = startingValues[symbol]
            dataPoint[symbol] = (data[index].close - startValue) / startValue * 100
          } else {
            // Use actual price
            dataPoint[symbol] = data[index].close
          }
        }
      })
      
      return dataPoint
    })
  }
  
  // Format the y-axis ticks
  const formatYAxis = (value: number) => {
    if (normalizeData) {
      return `${value.toFixed(0)}%`
    } else {
      return `$${value.toFixed(0)}`
    }
  }
  
  // Define proper types for the tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      color: string;
    }>;
    label?: string;
  }
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <div className="space-y-1 mt-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium">{entry.name}:</span>
                <span className="text-xs">
                  {normalizeData 
                    ? `${entry.value.toFixed(2)}%` 
                    : `$${entry.value.toFixed(2)}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return null
  }
  
  const chartData = prepareChartData()
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Compare Stocks</h1>
          <p className="text-muted-foreground mt-1">Analyze and compare performance of multiple stocks</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Add Stocks</h2>
            <div className="space-y-3">
              <StockSearch onSelect={handleAddStock} />
              
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}
              
              {comparedStocks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Selected Stocks</h3>
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {comparedStocks.map((stock, index) => (
                        <motion.li 
                          key={stock.symbol}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            />
                            <span className="font-medium">{stock.symbol}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRemoveStock(stock.symbol)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove {stock.symbol}</span>
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Chart Options</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Time Range</h3>
                <Tabs
                  defaultValue="daily"
                  value={timeframe}
                  onValueChange={(value) => setTimeframe(value as "daily" | "weekly" | "monthly")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Display</h3>
                <div className="flex gap-2">
                  <Button
                    variant={normalizeData ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNormalizeData(true)}
                    className="flex-1"
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" />
                    Relative %
                  </Button>
                  <Button
                    variant={!normalizeData ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNormalizeData(false)}
                    className="flex-1"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Actual $
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {comparedStocks.length === 0 ? (
            <div className="border rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Stocks to Compare</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Add stocks using the search box to start comparing their performance
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="border rounded-lg p-8 flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Performance Comparison</h2>
                <div className="text-xs text-muted-foreground">
                  {normalizeData ? "% Change (normalized)" : "Stock Price ($)"}
                </div>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                      domain={normalizeData ? ['dataMin', 'dataMax'] : ['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {comparedStocks.map((stock, index) => (
                      <Line
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        name={stock.symbol}
                        stroke={chartColors[index % chartColors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {normalizeData && comparedStocks.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">Performance Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {comparedStocks.map((stock, index) => {
                      const stockData = historicalData[stock.symbol] || []
                      let percentChange = 0
                      
                      if (stockData.length >= 2) {
                        const firstPrice = stockData[0].close
                        const lastPrice = stockData[stockData.length - 1].close
                        percentChange = ((lastPrice - firstPrice) / firstPrice) * 100
                      }
                      
                      return (
                        <div 
                          key={stock.symbol}
                          className="border rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            />
                            <span className="font-medium">{stock.symbol}</span>
                          </div>
                          <div className={`text-lg font-bold ${
                            percentChange >= 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(2)}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {timeframe === "daily" ? "Past 30 days" : 
                             timeframe === "weekly" ? "Past 52 weeks" : 
                             "Past 24 months"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <StockComparisonManager />
      </SiteWrapper>
    </StockProvider>
  )
} 