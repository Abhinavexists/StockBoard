"use client"

import { useStocks } from "@/context/stock-context"
import { StockCard } from "@/components/stock-card"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Button, Alert, AlertDescription } from "@/components/ui"
import { motion } from "framer-motion"

export default function TrendingStocks() {
  const { trendingStocks, refreshStocks, isLoading, apiError, resetAndRetryStocks } = useStocks()
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      } 
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <section className="space-y-4 md:space-y-6 animate-fade-in">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative"
        initial="hidden"
        animate="show"
        variants={headerVariants}
      >
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Trending Stocks</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => apiError ? resetAndRetryStocks() : refreshStocks()}
            disabled={isLoading && !apiError}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading && !apiError ? "animate-spin" : ""}`} />
            {apiError ? "Retry Connection" : "Refresh"}
          </Button>
        </motion.div>
        
        {/* Small refreshing indicator when data exists but we're updating */}
        {isLoading && !apiError && trendingStocks.length > 0 && (
          <span className="absolute right-0 top-full text-xs text-muted-foreground flex items-center gap-1 pt-1">
            <span className="animate-spin h-2 w-2 border-b-2 border-primary rounded-full inline-block" />
            Refreshing...
          </span>
        )}
      </motion.div>

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to the stock API. Please check your connection or try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Full spinner only shown when no data and loading */}
      {isLoading && trendingStocks.length === 0 && !apiError && (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading trending stocks...</p>
          </div>
        </div>
      )}

      {/* No stocks available message */}
      {!isLoading && trendingStocks.length === 0 && !apiError ? (
        <motion.div 
          className="flex justify-center items-center h-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No trending stocks available</p>
            <Button onClick={() => refreshStocks()}>Retry Loading Stocks</Button>
          </div>
        </motion.div>
      ) : (
        /* Show stock grid if we have data or we're in error state */
        (trendingStocks.length > 0 || apiError) && (
          <motion.div
            className="responsive-grid"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {trendingStocks.map((stock, index) => (
              <motion.div 
                key={stock.symbol} 
                variants={item}
                className="animate-delay-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StockCard stock={stock} />
              </motion.div>
            ))}
          </motion.div>
        )
      )}
    </section>
  )
} 