"use client"

import { motion } from "framer-motion"
import { useStocks } from "@/context/stock-context"
import { SiteWrapper } from "@/components/site-wrapper"
import { StockProvider } from "@/context/stock-context"
import { StockCard } from "@/components/stock-card"
import { StockSearch } from "@/components/stock-search"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

function WatchlistContent() {
  const { watchlistStocks, refreshStocks, isLoading } = useStocks()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Watchlist</h1>
          <p className="text-muted-foreground">
            Track and monitor your favorite stocks in one place.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={() => refreshStocks()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="max-w-lg">
        <StockSearch />
      </div>

      {watchlistStocks.length === 0 ? (
        <div className="py-8 md:py-12 text-center border rounded-lg">
          <h3 className="text-lg sm:text-xl font-medium mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto px-4 sm:px-0">
            Search for stocks and add them to your watchlist by clicking the star icon.
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {watchlistStocks.map((stock) => (
            <motion.div key={stock.symbol} variants={item}>
              <StockCard stock={stock} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}

export default function WatchlistPage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <WatchlistContent />
      </SiteWrapper>
    </StockProvider>
  )
} 