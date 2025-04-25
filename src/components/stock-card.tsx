"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Star, X } from "lucide-react"
import { StockData } from "@/lib/api"
import { useStocks } from "@/context/stock-context"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"

interface StockCardProps {
  stock: StockData;
  showRemoveButton?: boolean;
  onRemove?: (symbol: string) => void;
}

export function StockCard({ stock, showRemoveButton = false, onRemove }: StockCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useStocks()
  const isWatchlisted = isInWatchlist(stock.symbol)

  const toggleWatchlist = () => {
    if (isWatchlisted) {
      removeFromWatchlist(stock.symbol)
    } else {
      addToWatchlist(stock.symbol)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemove) {
      onRemove(stock.symbol)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`
    } else if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    } else {
      return `$${num.toLocaleString()}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`
    } else if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`
    } else {
      return volume.toLocaleString()
    }
  }

  // Card animation variants
  const cardVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  // Content animation variants
  const contentVariants = {
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20
      }
    }
  };

  // Price animation variants
  const priceVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      className="h-full"
    >
      <motion.div variants={cardVariants} className="h-full">
        <Card className="overflow-hidden h-full flex flex-col relative">
          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground z-10"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-start gap-2">
              <div className="flex-1 truncate">
                <Link href={`/stocks/${stock.symbol}`}>
                  <motion.span 
                    className="font-semibold hover:underline"
                    whileHover={{ color: "hsl(var(--primary))" }}
                  >
                    {stock.symbol}
                  </motion.span>
                </Link>
                <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
              </div>
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Toggle 
                aria-label="Toggle watchlist"
                pressed={isWatchlisted}
                onPressedChange={toggleWatchlist}
                className="transition-all duration-300"
              >
                <Star className={`h-4 w-4 transition-all duration-300 ${isWatchlisted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Toggle>
            </motion.div>
          </CardHeader>
          <CardContent className="flex-grow">
            <motion.div 
              className="flex justify-between items-baseline"
              variants={contentVariants}
            >
              <motion.div 
                className="text-2xl font-bold"
                variants={priceVariants}
              >
                ${stock.price.toFixed(2)}
              </motion.div>
              <motion.div
                className={`flex items-center ${
                  stock.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {stock.change >= 0 ? (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                )}
                <span>{Math.abs(stock.change).toFixed(2)}</span>
                <span className="ml-1">
                  ({Math.abs(stock.changePercent).toFixed(2)}%)
                </span>
              </motion.div>
            </motion.div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Volume</p>
                <p className="font-medium">{formatVolume(stock.volume)}</p>
              </div>
              {stock.marketCap && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Market Cap</p>
                  <p className="font-medium">{formatNumber(stock.marketCap)}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-0 pt-0 mt-auto">
            <Link
              href={`/stocks/${stock.symbol}`}
              className="w-full flex justify-center py-2 text-sm hover:bg-muted transition-colors"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full text-center"
              >
                View Details
              </motion.div>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
} 