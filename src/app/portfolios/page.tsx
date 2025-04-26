"use client"

import { useState } from "react"
import { SiteWrapper } from "@/components/site-wrapper"
import { StockProvider, useStocks } from "@/context/stock-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockSearch } from "@/components/stock-search"
import { StockCard } from "@/components/stock-card"
import { PlusCircle, Trash2, Briefcase, Edit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StockData } from "@/lib/api"

function PortfolioManager() {
  const { 
    portfolios, 
    createPortfolio, 
    deletePortfolio, 
    addToPortfolio, 
    removeFromPortfolio,
    getPortfolioStocks,
    activePortfolio,
    setActivePortfolio
  } = useStocks()
  
  const [newPortfolioName, setNewPortfolioName] = useState("")
  const [portfolioStocks, setPortfolioStocks] = useState<StockData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePortfolio = () => {
    if (newPortfolioName.trim()) {
      createPortfolio(newPortfolioName.trim())
      setNewPortfolioName("")
      setIsDialogOpen(false)
    }
  }

  const handleSelectPortfolio = async (portfolioId: string) => {
    setIsLoading(true)
    setSelectedPortfolioId(portfolioId)
    const portfolio = portfolios.find(p => p.id === portfolioId) || null
    setActivePortfolio(portfolio)
    
    if (portfolio) {
      const stocks = await getPortfolioStocks(portfolioId)
      setPortfolioStocks(stocks)
    }
    setIsLoading(false)
  }

  const handleRemoveStock = (symbol: string) => {
    if (selectedPortfolioId) {
      removeFromPortfolio(selectedPortfolioId, symbol)
      setPortfolioStocks(prev => prev.filter(stock => stock.symbol !== symbol))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Portfolios</h1>
          <p className="text-muted-foreground mt-1">Create and manage your stock portfolios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Portfolio</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Portfolio</DialogTitle>
              <DialogDescription>
                Give your portfolio a name to get started
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="portfolio-name"
                placeholder="My Growth Portfolio"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreatePortfolio}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <span>Your Portfolios</span>
            </h2>
            
            {portfolios.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground mb-4">You don&apos;t have any portfolios yet</p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  Create your first portfolio
                </Button>
              </div>
            ) : (
              <motion.ul 
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {portfolios.map((portfolio) => (
                  <motion.li 
                    key={portfolio.id}
                    variants={itemVariants}
                  >
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center transition-colors ${
                        selectedPortfolioId === portfolio.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent"
                      }`}
                      onClick={() => handleSelectPortfolio(portfolio.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{portfolio.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full">
                          {portfolio.stocks.length} {portfolio.stocks.length === 1 ? 'stock' : 'stocks'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-1 text-primary-foreground/80 hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePortfolio(portfolio.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          {selectedPortfolioId && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Add stocks to portfolio</h3>
              <StockSearch onSelect={(symbol) => {
                if (selectedPortfolioId) {
                  addToPortfolio(selectedPortfolioId, symbol)
                  handleSelectPortfolio(selectedPortfolioId)
                }
              }} />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {!selectedPortfolioId ? (
            <div className="border rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Select a Portfolio</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Choose a portfolio from the list or create a new one to view and manage your stocks
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Create New Portfolio
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-4 md:p-6">
              {activePortfolio && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium">{activePortfolio.name}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span>Rename</span>
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : portfolioStocks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No stocks in this portfolio yet</p>
                      <p className="text-sm text-muted-foreground mb-6">Use the stock search to add stocks to your portfolio</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {portfolioStocks.map((stock) => (
                          <motion.div 
                            key={stock.symbol}
                            variants={itemVariants}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <StockCard 
                              stock={stock} 
                              onRemove={() => handleRemoveStock(stock.symbol)}
                              showRemoveButton 
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PortfoliosPage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <PortfolioManager />
      </SiteWrapper>
    </StockProvider>
  )
} 