"use client"

import { useState, useEffect } from "react"
import { SiteWrapper } from "@/components/site-wrapper"
import { StockProvider, useStocks } from "@/context/stock-context"
import { StockData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockSearch } from "@/components/stock-search"
import { Badge } from "@/components/ui/badge"
import { BellRing, Plus, ArrowUpRight, ArrowDownRight, Trash2, Bell, BellOff, AlertTriangle } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function AlertManager() {
  const { 
    priceAlerts, 
    createPriceAlert, 
    deletePriceAlert, 
    getAlertedStocks,
    triggeredAlerts,
    clearTriggeredAlerts
  } = useStocks()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [alertStocks, setAlertStocks] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // New alert form state
  const [selectedSymbol, setSelectedSymbol] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [alertType, setAlertType] = useState<"above" | "below">("above")
  
  // Initial load of alert stocks
  useEffect(() => {
    loadAlertStocks()
  }, [priceAlerts])
  
  const loadAlertStocks = async () => {
    setIsLoading(true)
    try {
      const stocks = await getAlertedStocks()
      setAlertStocks(stocks)
    } catch (error) {
      console.error("Error loading alert stocks:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateAlert = () => {
    if (selectedSymbol && targetPrice) {
      const price = parseFloat(targetPrice)
      if (!isNaN(price) && price > 0) {
        createPriceAlert(
          selectedSymbol, 
          price, 
          alertType === "above"
        )
        resetForm()
        setIsDialogOpen(false)
      }
    }
  }
  
  const resetForm = () => {
    setSelectedSymbol("")
    setTargetPrice("")
    setAlertType("above")
  }
  
  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    
    // Try to find current price for this stock
    const stock = alertStocks.find(s => s.symbol === symbol)
    if (stock) {
      setTargetPrice(stock.price.toFixed(2))
    }
  }
  
  const getAlertStatus = (alertId: string) => {
    const alert = priceAlerts.find(a => a.id === alertId)
    if (!alert) return "unknown"
    
    if (alert.triggered) return "triggered"
    
    const stock = alertStocks.find(s => s.symbol === alert.symbol)
    if (!stock) return "pending"
    
    if (alert.isAbove) {
      return stock.price >= alert.targetPrice ? "triggered" : "pending"
    } else {
      return stock.price <= alert.targetPrice ? "triggered" : "pending"
    }
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Animation variants
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
    <AnimatePresence>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Price Alerts</h1>
            <p className="text-muted-foreground mt-1">Get notified when stocks hit your target prices</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>New Alert</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogDescription>
                  Set up an alert to be notified when a stock reaches your target price
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Stock Symbol</h4>
                  <StockSearch onSelect={handleStockSelect} />
                  {selectedSymbol && (
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedSymbol}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Target Price</h4>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Alert Type</h4>
                    <Select
                      value={alertType}
                      onValueChange={(value) => setAlertType(value as "above" | "below")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">
                          <div className="flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Price goes above</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="below">
                          <div className="flex items-center">
                            <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                            <span>Price goes below</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleCreateAlert}
                  disabled={!selectedSymbol || !targetPrice}
                >
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      
        {/* Alert notifications */}
        {triggeredAlerts.length > 0 && (
          <motion.div 
            className="border border-yellow-500/20 bg-yellow-500/10 rounded-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">Triggered Alerts</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearTriggeredAlerts}
              >
                Dismiss All
              </Button>
            </div>
            
            <div className="space-y-2">
              {triggeredAlerts.map((alert) => {
                const stock = alertStocks.find(s => s.symbol === alert.symbol)
                const currentPrice = stock?.price || 0
                
                return (
                  <motion.div 
                    key={alert.id}
                    className="flex justify-between items-center p-2 bg-background/80 rounded border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div>
                      <div className="font-medium">{alert.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.isAbove ? 'Price above' : 'Price below'} {formatPrice(alert.targetPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={currentPrice > 0 ? (currentPrice > alert.targetPrice ? 'text-green-500' : 'text-red-500') : ''}>
                        {currentPrice > 0 ? formatPrice(currentPrice) : 'Loading...'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Triggered {formatDate(alert.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : priceAlerts.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <BellRing className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No Price Alerts Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create price alerts to get notified when stocks reach your target prices
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Target Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Current Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <AnimatePresence>
                    {priceAlerts.map((alert) => {
                      const stock = alertStocks.find(s => s.symbol === alert.symbol)
                      const currentPrice = stock?.price || 0
                      const alertStatus = getAlertStatus(alert.id)
                      
                      return (
                        <motion.tr 
                          key={alert.id}
                          variants={itemVariants}
                          exit={{ opacity: 0, height: 0 }}
                          className="hover:bg-muted/30"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{alert.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {stock?.name || 'Loading...'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {alert.isAbove ? (
                                <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                              )}
                              <span>{formatPrice(alert.targetPrice)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {alert.isAbove ? 'Above' : 'Below'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {currentPrice > 0 ? (
                              <div className={currentPrice >= alert.targetPrice ? 'text-green-500' : ''}>
                                {formatPrice(currentPrice)}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">Loading...</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={alertStatus === 'triggered' ? 'destructive' : alertStatus === 'pending' ? 'outline' : 'secondary'}
                            >
                              {alertStatus === 'triggered' ? (
                                <span className="flex items-center gap-1">
                                  <BellRing className="h-3 w-3" /> Triggered
                                </span>
                              ) : alertStatus === 'pending' ? (
                                <span className="flex items-center gap-1">
                                  <Bell className="h-3 w-3" /> Pending
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <BellOff className="h-3 w-3" /> Unknown
                                </span>
                              )}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(alert.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePriceAlert(alert.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}

export default function AlertsPage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <AlertManager />
      </SiteWrapper>
    </StockProvider>
  )
} 