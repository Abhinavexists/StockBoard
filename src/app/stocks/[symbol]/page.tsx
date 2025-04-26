"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Star, RefreshCw, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { StockData, StockHistoricalData, getStockQuote, getHistoricalData } from "@/lib/api"
import { SiteWrapper } from "@/components/site-wrapper"
import { StockProvider, useStocks } from "@/context/stock-context"
import { StockChart } from "@/components/stock-chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { StockSearch } from "@/components/stock-search"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function StockDetails() {
  const params = useParams<{ symbol: string }>()
  const symbol = params.symbol as string
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStocks()
  const [stock, setStock] = useState<StockData | null>(null)
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const toggleWatchlist = () => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol)
    } else {
      addToWatchlist(symbol)
    }
  }

  const fetchStockData = async () => {
    setIsRefreshing(true)
    try {
      const stockData = await getStockQuote(symbol)
      setStock(stockData)
      
      const histData = await getHistoricalData(symbol, timeframe)
      // Ensure histData is valid before setting state
      if (Array.isArray(histData) && histData.length > 0) {
        setHistoricalData(histData)
      } else {
        console.warn("Received empty or invalid historical data")
        // Keep previous data or set empty array if none exists
        setHistoricalData(prev => prev.length > 0 ? prev : [])
      }
    } catch (error) {
      console.error("Error fetching stock data:", error)
      // Keep the previous data if there was an error
      // This prevents UI from breaking when API fails temporarily
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchStockData()
    
    // Set up polling for stock updates (every 15 seconds)
    const intervalId = setInterval(() => {
      fetchStockData()
    }, 15000)
    
    return () => clearInterval(intervalId)
  }, [symbol, timeframe])

  // Handle timeframe change
  const handleTimeframeChange = async (value: string) => {
    const newTimeframe = value as "daily" | "weekly" | "monthly"
    setTimeframe(newTimeframe)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Format large numbers with commas
  const formatLargeNumber = (num: number | undefined | null): string => {
    if (typeof num !== 'number' || isNaN(num)) return "-";
    return num.toLocaleString('en-US');
  }

  // Calculate year-to-date return (mock function - would use real data in production)
  const calculateYTD = (): number => {
    return Math.random() * 20 - 10; // Random value between -10% and +10%
  }

  // Helper to safely format numbers
  const safeToFixed = (value: number | undefined | null, digits = 2, fallback = "-") => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(digits)
    }
    return fallback
  }

  if (isLoading && !stock) {
    return (
      <div className="py-6 md:py-10 flex justify-center">
        <div className="animate-pulse space-y-4 md:space-y-6 w-full max-w-4xl">
          <div className="h-8 bg-muted rounded w-1/3 sm:w-1/4"></div>
          <div className="h-48 sm:h-64 bg-muted rounded"></div>
          <div className="h-32 sm:h-40 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <motion.div 
        className="py-6 md:py-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Stock not found</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto px-4 sm:px-0">
          We couldn&apos;t find the stock you&apos;re looking for.
        </p>
        <div className="max-w-md mx-auto px-4 sm:px-0">
          <StockSearch />
        </div>
      </motion.div>
    )
  }

  // Calculate if the stock is positive year-to-date
  const ytdReturn = calculateYTD();
  const isPositiveYTD = ytdReturn >= 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={symbol}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6 md:space-y-8"
      >
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-4 md:pb-6"
          variants={itemVariants}
        >
          <div>
            <div className="flex items-start gap-2 md:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{symbol}</h1>
              <div className="flex gap-2 items-center mt-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Toggle
                    aria-label="Toggle watchlist"
                    pressed={isInWatchlist(symbol)}
                    onPressedChange={toggleWatchlist}
                    className="transition-all duration-300"
                  >
                    <Star className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${isInWatchlist(symbol) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Toggle>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    size="icon"
                    variant="outline"
                    onClick={fetchStockData}
                    disabled={isRefreshing}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </motion.div>
              </div>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg mt-1">{stock.name}</p>
          </div>
          
          <motion.div 
            className="flex flex-col items-start md:items-end mt-2 md:mt-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center gap-2">
              <div className="text-2xl sm:text-3xl font-bold">${safeToFixed(stock?.price)}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last updated: {new Date().toLocaleTimeString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div
              className={`flex items-center ${
                stock.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stock.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>{safeToFixed(Math.abs(stock.change))}</span>
              <span className="ml-1">
                ({safeToFixed(Math.abs(stock.changePercent))}%)
              </span>
            </div>
            <div className={`text-xs mt-1 ${isPositiveYTD ? "text-green-500" : "text-red-500"}`}>
              YTD: {isPositiveYTD ? "+" : ""}{safeToFixed(ytdReturn)}%
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Price History</h2>
            <Tabs
              defaultValue="daily"
              value={timeframe}
              onValueChange={handleTimeframeChange}
              className="w-full sm:w-auto max-w-[300px]"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={timeframe}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <StockChart data={historicalData} symbol={symbol} />
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-6">
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Open</p>
              <p className="font-medium">${safeToFixed(stock.open)}</p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Previous Close</p>
              <p className="font-medium">${safeToFixed(stock.previousClose)}</p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Day's Range</p>
              <p className="font-medium">
                ${safeToFixed(stock.low)} - ${safeToFixed(stock.high)}
              </p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Volume</p>
              <p className="font-medium">{formatLargeNumber(stock.volume)}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Market Cap</p>
              <p className="font-medium">
                {stock.marketCap 
                  ? `$${safeToFixed(stock.marketCap / 1000000000)}B` 
                  : "N/A"}
              </p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">52 Week High</p>
              <p className="font-medium">
                ${safeToFixed((stock.price * (1 + Math.random() * 0.3)))}
              </p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">52 Week Low</p>
              <p className="font-medium">
                ${safeToFixed((stock.price * (1 - Math.random() * 0.3)))}
              </p>
            </motion.div>
            <motion.div 
              className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <p className="text-muted-foreground text-sm">Avg. Volume</p>
              <p className="font-medium">
                {formatLargeNumber(Math.floor(stock.volume * (0.8 + Math.random() * 0.4)))}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function StockPage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <StockDetails />
      </SiteWrapper>
    </StockProvider>
  )
} 