"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp } from "lucide-react"
import { searchStocks, SearchResult, getTrendingStocks } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StockSearch({ onSelect }: { onSelect?: (symbol: string) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("search")
  const [trendingStocks, setTrendingStocks] = useState<SearchResult[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dialogSearchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 1) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await searchStocks(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching stocks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch trending stocks for the suggestions tab
  useEffect(() => {
    async function fetchTrendingStocks() {
      try {
        const stocks = await getTrendingStocks();
        const trendingResults = stocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          type: "Equity",
          region: "United States", 
          currency: "USD"
        }));
        setTrendingStocks(trendingResults);
      } catch (error) {
        console.error("Error fetching trending stocks:", error);
      }
    }
    
    fetchTrendingStocks();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const handleSelect = (symbol: string) => {
    setIsOpen(false)
    setQuery("")
    if (onSelect) {
      onSelect(symbol)
    } else {
      router.push(`/stocks/${symbol}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (results.length > 0) {
      handleSelect(results[0].symbol)
    }
  }

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && dialogSearchInputRef.current) {
      setTimeout(() => {
        dialogSearchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const renderStockItem = (stock: SearchResult, index: number) => (
    <motion.li 
      key={stock.symbol}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex justify-between items-center rounded-md"
        onClick={() => handleSelect(stock.symbol)}
      >
        <div>
          <p className="font-medium">{stock.symbol}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{stock.name}</p>
        </div>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">{stock.region}</span>
      </button>
    </motion.li>
  );

  return (
    <>
      {/* Desktop search */}
      <form 
        className="hidden sm:flex relative rounded-md"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search for a stock..."
            className="pl-9 pr-12 py-2 flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
          <Button type="submit" variant="ghost" className="absolute right-0 top-0 h-full px-3">
          <span className="sr-only">Search</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            ⏎
          </kbd>
        </Button>
      </form>

      {/* Mobile search dialog */}
      <div className="sm:hidden">
        <Button 
          variant="outline" 
          className="flex justify-between w-full text-muted-foreground font-normal"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            <span>Search for a stock...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Search results dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Find Stocks</DialogTitle>
            <DialogDescription>
              Search by company name or ticker symbol
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={dialogSearchInputRef}
                placeholder="Search stocks..."
                className="pl-9 pr-4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <Tabs 
            defaultValue="search" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="search" className="flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Trending</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="mt-0">
              <div className="max-h-72 overflow-y-auto space-y-1">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : results.length > 0 ? (
                  <ul>
                    {results.map((stock, index) => renderStockItem(stock, index))}
                  </ul>
                ) : query.trim() !== "" ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground">Try searching for a different symbol or company name</p>
                  </div>
                ) : null}
              </div>
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <div className="max-h-72 overflow-y-auto space-y-1">
                {trendingStocks.length > 0 ? (
                  <ul>
                    {trendingStocks.map((stock, index) => renderStockItem(stock, index))}
                  </ul>
                ) : (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
} 