"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useRef
} from "react"
import { 
  StockData, 
  getTrendingStocks, 
  getStockQuote 
} from "@/lib/api"

interface Portfolio {
  id: string;
  name: string;
  stocks: string[];
  createdAt: string;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  isAbove: boolean; // true for price above, false for price below
  createdAt: string;
  triggered: boolean;
}

interface StockContextType {
  trendingStocks: StockData[]
  watchlist: string[]
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  isInWatchlist: (symbol: string) => boolean
  watchlistStocks: StockData[]
  refreshStocks: () => Promise<void>
  isLoading: boolean
  portfolios: Portfolio[]
  createPortfolio: (name: string) => void
  deletePortfolio: (id: string) => void
  addToPortfolio: (portfolioId: string, symbol: string) => void
  removeFromPortfolio: (portfolioId: string, symbol: string) => void
  getPortfolioStocks: (portfolioId: string) => Promise<StockData[]>
  activePortfolio: Portfolio | null
  setActivePortfolio: (portfolio: Portfolio | null) => void
  priceAlerts: PriceAlert[]
  createPriceAlert: (symbol: string, targetPrice: number, isAbove: boolean) => void
  deletePriceAlert: (id: string) => void
  getAlertedStocks: () => Promise<StockData[]>
  clearTriggeredAlerts: () => void
  triggeredAlerts: PriceAlert[]
  apiError: boolean
  resetAndRetryStocks: () => void
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: ReactNode }) {
  const [trendingStocks, setTrendingStocks] = useState<StockData[]>([])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [watchlistStocks, setWatchlistStocks] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const failureCountRef = useRef(0)
  const MAX_FAILURES = 5
  const [apiError, setApiError] = useState(false)

  // Initialize watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist")
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist))
      } catch (error) {
        console.error("Error parsing watchlist from localStorage:", error)
        localStorage.removeItem("watchlist")
      }
    }
  }, [])

  // Initialize portfolios from localStorage
  useEffect(() => {
    const savedPortfolios = localStorage.getItem("portfolios")
    if (savedPortfolios) {
      try {
        setPortfolios(JSON.parse(savedPortfolios))
      } catch (error) {
        console.error("Error parsing portfolios from localStorage:", error)
        localStorage.removeItem("portfolios")
      }
    }
  }, [])

  // Initialize price alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts")
    if (savedAlerts) {
      try {
        setPriceAlerts(JSON.parse(savedAlerts))
      } catch (error) {
        console.error("Error parsing price alerts from localStorage:", error)
        localStorage.removeItem("priceAlerts")
      }
    }
  }, [])

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
  }, [watchlist])

  // Save portfolios to localStorage when they change
  useEffect(() => {
    localStorage.setItem("portfolios", JSON.stringify(portfolios))
  }, [portfolios])

  // Save price alerts to localStorage when they change
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(priceAlerts))
  }, [priceAlerts])

  // Load trending stocks on mount
  useEffect(() => {
    console.log("StockProvider mounted - loading initial data")
    refreshStocks()
    setApiError(false)
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(() => {
      refreshStocks()
    }, 15000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Update watchlist stocks whenever watchlist changes
  useEffect(() => {
    async function fetchWatchlistStocks() {
      if (watchlist.length === 0) {
        setWatchlistStocks([])
        return
      }

      const stocks = await Promise.all(
        watchlist.map(async (symbol) => {
          const stock = await getStockQuote(symbol)
          return stock
        })
      )

      setWatchlistStocks(stocks.filter((stock): stock is StockData => stock !== null))
    }

    fetchWatchlistStocks()
  }, [watchlist])

  // Check for triggered price alerts whenever stocks refresh
  useEffect(() => {
    if (watchlistStocks.length === 0 || priceAlerts.length === 0) return

    const newTriggeredAlerts: PriceAlert[] = []

    // Check each alert against current stock prices
    priceAlerts.forEach(alert => {
      if (alert.triggered) return // Skip already triggered alerts
      
      const stock = watchlistStocks.find(s => s.symbol === alert.symbol)
      if (!stock) return
      
      const isTriggered = alert.isAbove 
        ? stock.price >= alert.targetPrice 
        : stock.price <= alert.targetPrice
      
      if (isTriggered) {
        const triggeredAlert = { ...alert, triggered: true }
        newTriggeredAlerts.push(triggeredAlert)
        
        // Update the alert in the main alerts array
        setPriceAlerts(prev => 
          prev.map(a => a.id === alert.id ? triggeredAlert : a)
        )
      }
    })

    if (newTriggeredAlerts.length > 0) {
      setTriggeredAlerts(prev => [...prev, ...newTriggeredAlerts])
    }
  }, [watchlistStocks, priceAlerts])

  // Refresh all stocks data
  const refreshStocks = async () => {
    console.log("Refreshing stocks data...")
    setIsLoading(true)
    try {
      const trending = await getTrendingStocks()
      console.log("Trending stocks loaded:", trending)
      if (Array.isArray(trending) && trending.length > 0) {
        setTrendingStocks(prev => {
          const prevStr = JSON.stringify(prev)
          const nextStr = JSON.stringify(trending)
          if (prevStr !== nextStr) return trending
          return prev
        })
        failureCountRef.current = 0 // reset on success
        setApiError(false)
      } else {
        console.error("Trending stocks API returned invalid data:", trending)
        failureCountRef.current++
      }
      if (watchlist.length > 0) {
        const stocks = await Promise.all(
          watchlist.map(async (symbol) => {
            const stock = await getStockQuote(symbol)
            return stock
          })
        )
        setWatchlistStocks(stocks.filter((stock): stock is StockData => stock !== null))
      }
    } catch (error) {
      console.error("Error refreshing stocks:", error)
      failureCountRef.current++
    } finally {
      setIsLoading(false)
      if (failureCountRef.current >= MAX_FAILURES && pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
        setApiError(true)
        console.error("Stopped polling due to repeated API failures.")
      }
    }
  }

  // Manual retry/reset function
  const resetAndRetryStocks = () => {
    failureCountRef.current = 0
    setApiError(false)
    refreshStocks()
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        refreshStocks()
      }, 15000)
    }
  }

  // Add stock to watchlist
  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist((prev) => [...prev, symbol])
    }
  }

  // Remove stock from watchlist
  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol))
  }

  // Check if stock is in watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol)
  }

  // Create a new portfolio
  const createPortfolio = (name: string) => {
    const newPortfolio: Portfolio = {
      id: Date.now().toString(),
      name,
      stocks: [],
      createdAt: new Date().toISOString(),
    }
    setPortfolios((prev) => [...prev, newPortfolio])
    return newPortfolio
  }

  // Delete a portfolio
  const deletePortfolio = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id))
    if (activePortfolio?.id === id) {
      setActivePortfolio(null)
    }
  }

  // Add stock to portfolio
  const addToPortfolio = (portfolioId: string, symbol: string) => {
    setPortfolios((prev) => 
      prev.map((portfolio) => {
        if (portfolio.id === portfolioId && !portfolio.stocks.includes(symbol)) {
          return {
            ...portfolio,
            stocks: [...portfolio.stocks, symbol]
          }
        }
        return portfolio
      })
    )
  }

  // Remove stock from portfolio
  const removeFromPortfolio = (portfolioId: string, symbol: string) => {
    setPortfolios((prev) => 
      prev.map((portfolio) => {
        if (portfolio.id === portfolioId) {
          return {
            ...portfolio,
            stocks: portfolio.stocks.filter((s) => s !== symbol)
          }
        }
        return portfolio
      })
    )
  }

  // Get stocks for a specific portfolio
  const getPortfolioStocks = async (portfolioId: string): Promise<StockData[]> => {
    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (!portfolio || portfolio.stocks.length === 0) {
      return []
    }

    const stocks = await Promise.all(
      portfolio.stocks.map(async (symbol) => {
        const stock = await getStockQuote(symbol)
        return stock
      })
    )

    return stocks.filter((stock): stock is StockData => stock !== null)
  }

  // Create a new price alert
  const createPriceAlert = (symbol: string, targetPrice: number, isAbove: boolean) => {
    // Add to watchlist automatically if not already there
    if (!watchlist.includes(symbol)) {
      addToWatchlist(symbol)
    }
    
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      targetPrice,
      isAbove,
      createdAt: new Date().toISOString(),
      triggered: false
    }
    
    setPriceAlerts(prev => [...prev, newAlert])
  }

  // Delete a price alert
  const deletePriceAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  // Get all stocks that have alerts
  const getAlertedStocks = async (): Promise<StockData[]> => {
    const alertSymbols = [...new Set(priceAlerts.map(alert => alert.symbol))]
    
    if (alertSymbols.length === 0) {
      return []
    }
    
    const stocks = await Promise.all(
      alertSymbols.map(async (symbol) => {
        const stock = await getStockQuote(symbol)
        return stock
      })
    )
    
    return stocks.filter((stock): stock is StockData => stock !== null)
  }

  // Clear all triggered alerts
  const clearTriggeredAlerts = () => {
    setTriggeredAlerts([])
  }

  return (
    <StockContext.Provider
      value={{
        trendingStocks,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        watchlistStocks,
        refreshStocks,
        isLoading,
        portfolios,
        createPortfolio,
        deletePortfolio,
        addToPortfolio,
        removeFromPortfolio,
        getPortfolioStocks,
        activePortfolio,
        setActivePortfolio,
        priceAlerts,
        createPriceAlert,
        deletePriceAlert,
        getAlertedStocks,
        clearTriggeredAlerts,
        triggeredAlerts,
        apiError,
        resetAndRetryStocks,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStocks() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error("useStocks must be used within a StockProvider")
  }
  return context
} 