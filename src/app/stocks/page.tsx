import { Metadata } from "next"
import { SiteWrapper } from "@/components/site-wrapper" 
import { StockProvider } from "@/context/stock-context"
import TrendingStocks from "@/components/trending-stocks"
import { StockSearch } from "@/components/stock-search"

export const metadata: Metadata = {
  title: "Dashboard | Stocks",
  description: "Browse and search for stocks to add to your watchlist",
}

export default function StocksPage() {
  return (
    <StockProvider>
      <SiteWrapper>
        <section className="space-y-6 md:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Stocks</h1>
            <p className="text-muted-foreground">
              Browse and search for stocks to view details and add to your watchlist.
            </p>
          </div>

          <div className="max-w-lg">
            <StockSearch />
          </div>

          <TrendingStocks />
        </section>
      </SiteWrapper>
    </StockProvider>
  )
} 