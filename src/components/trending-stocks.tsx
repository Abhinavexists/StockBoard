"use client"

import { useStocks } from "@/context/stock-context"
import { StockCard } from "@/components/stock-card"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect } from "react"

export default function TrendingStocks() {
  const { trendingStocks, refreshStocks, isLoading } = useStocks()
  
  useEffect(() => {
    console.log("TrendingStocks render - isLoading:", isLoading)
    console.log("TrendingStocks render - stocksCount:", trendingStocks.length)
    console.log("TrendingStocks render - stocks:", trendingStocks)
    
    // Force a refresh on component mount
    refreshStocks()
  }, [refreshStocks])

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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
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
            onClick={() => refreshStocks()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading trending stocks...</p>
          </div>
        </div>
      )}

      {!isLoading && trendingStocks.length === 0 ? (
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
      )}
    </section>
  )
} 