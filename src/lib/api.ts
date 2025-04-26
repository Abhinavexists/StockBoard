// Stock API interface and fetching functions

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

export interface StockHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

// Base URLs - using only Finnhub API
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = "d06fke9r01qg26s7lp40d06fke9r01qg26s7lp4g"; // Your Finnhub API key

// Popular stock symbols to use for trending stocks
const POPULAR_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", 
  "META", "NVDA", "JPM", "V", "WMT",
  "NFLX", "PYPL", "DIS", "AMD", "SBUX", "INTC"
];

// Fallback data for when the API fails - this will ensure we always have something to show
const FALLBACK_STOCKS: StockData[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 182.52,
    change: 1.35,
    changePercent: 0.74,
    volume: 65321456,
    marketCap: 2850000000000,
    high: 183.92,
    low: 180.63,
    open: 181.27,
    previousClose: 181.17,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 417.88,
    change: 2.96,
    changePercent: 0.71,
    volume: 22867321,
    marketCap: 3100000000000,
    high: 419.42,
    low: 413.95,
    open: 414.32,
    previousClose: 414.92,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 171.05,
    change: -0.82,
    changePercent: -0.48,
    volume: 15763290,
    marketCap: 2100000000000,
    high: 172.53,
    low: 170.27,
    open: 171.92,
    previousClose: 171.87,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 186.67,
    change: 1.22,
    changePercent: 0.66,
    volume: 31567234,
    marketCap: 1950000000000,
    high: 187.42,
    low: 184.76,
    open: 185.21,
    previousClose: 185.45,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 178.23,
    change: -2.65,
    changePercent: -1.47,
    volume: 87654321,
    marketCap: 567000000000,
    high: 183.45,
    low: 177.89,
    open: 182.11,
    previousClose: 180.88,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 485.96,
    change: 5.42,
    changePercent: 1.13,
    volume: 19876543,
    marketCap: 1240000000000,
    high: 487.23,
    low: 478.65,
    open: 479.87,
    previousClose: 480.54,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 127.85,
    change: 3.47,
    changePercent: 2.79,
    volume: 41254789,
    marketCap: 3150000000000,
    high: 129.42,
    low: 126.21,
    open: 126.53,
    previousClose: 124.38,
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 207.43,
    change: 1.28,
    changePercent: 0.62,
    volume: 8675432,
    marketCap: 598000000000,
    high: 208.75,
    low: 206.11,
    open: 206.42,
    previousClose: 206.15,
  }
];

// Generate random historical data when real data is unavailable
function generateRandomHistoricalData(
  symbol: string,
  days = 30
): StockHistoricalData[] {
  const data: StockHistoricalData[] = [];
  const basePrice = Math.random() * 1000 + 100;
  const volatility = Math.random() * 10 + 5;

  let currentPrice = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    const open = currentPrice - Math.random() * 5;
    const close = currentPrice;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    data.push({
      date: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return data;
}

// Get quote for a specific stock symbol
export async function getStockQuote(symbol: string): Promise<StockData | null> {
  try {
    const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl)
    ]);
    
    const quoteData = await quoteResponse.json();
    const profileData = await profileResponse.json();
    
    // Check if we got valid response
    if (!quoteData || (quoteData.c === 0 && quoteData.h === 0)) {
      console.error("No data found for symbol:", symbol);
      return null;
    }
    
    return {
      symbol: symbol,
      name: profileData.name || symbol,
      price: quoteData.c,
      change: quoteData.d,
      changePercent: quoteData.dp,
      volume: quoteData.v,
      marketCap: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : undefined,
      high: quoteData.h,
      low: quoteData.l,
      open: quoteData.o,
      previousClose: quoteData.pc
    };
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

// Search for stocks by keyword
export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  
  try {
    const url = `${FINNHUB_BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.result || !Array.isArray(data.result)) {
      console.error("No search results found");
      return [];
    }
    
    const results: SearchResult[] = data.result.map((match: any) => ({
      symbol: match.symbol,
      name: match.description,
      type: match.type,
      region: "US", // Finnhub doesn't provide this directly
      currency: "USD", // Finnhub doesn't provide this directly
    }));
    return results;
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

// Get trending stocks
export async function getTrendingStocks(): Promise<StockData[]> {
  console.log("Getting trending stocks from Finnhub API");
  
  try {
    const stocksPromises = POPULAR_SYMBOLS.slice(0, 10).map(async (symbol) => {
      const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      
      try {
        const [quoteResponse, profileResponse] = await Promise.all([
          fetch(quoteUrl),
          fetch(profileUrl)
        ]);
        
        const quoteData = await quoteResponse.json();
        const profileData = await profileResponse.json();
        
        // Check if we got valid response
        if (quoteData.c === 0 && quoteData.h === 0) {
          throw new Error(`No valid data for ${symbol}`);
        }
        
        return {
          symbol: symbol,
          name: profileData.name || symbol,
          price: quoteData.c,
          change: quoteData.d,
          changePercent: quoteData.dp,
          volume: quoteData.v,
          marketCap: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : undefined,
          high: quoteData.h,
          low: quoteData.l,
          open: quoteData.o,
          previousClose: quoteData.pc
        };
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
        return null;
      }
    });
    
    const results = await Promise.all(stocksPromises);
    const validResults = results.filter(Boolean) as StockData[];
    
    if (validResults.length === 0) {
      console.error("No valid data returned from API, using fallback data");
      return FALLBACK_STOCKS;
    }
    
    return validResults;
  } catch (error) {
    console.error("Error fetching trending stocks, using fallback data:", error);
    return FALLBACK_STOCKS;
  }
}

// Get historical data for a stock
export async function getHistoricalData(
  symbol: string,
  interval: "daily" | "weekly" | "monthly" = "daily"
): Promise<StockHistoricalData[]> {
  try {
    // Convert to Finnhub's interval naming convention
    const resolution = interval === "daily" ? "D" : interval === "weekly" ? "W" : "M";
    
    // Get data for previous year
    const to = Math.floor(Date.now() / 1000);
    const from = to - 60 * 60 * 24 * 365; // 1 year ago
    
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.c || !data.t || data.s !== 'ok') {
      console.error(`No ${interval} data found for symbol:`, symbol);
      return generateRandomHistoricalData(symbol);
    }
    
    const historicalData: StockHistoricalData[] = [];
    
    // Process the data
    for (let i = 0; i < data.t.length; i++) {
      // Make sure all required values exist before accessing them
      if (data.t[i] === undefined || data.o[i] === undefined || 
          data.h[i] === undefined || data.l[i] === undefined || 
          data.c[i] === undefined || data.v[i] === undefined) {
        console.warn(`Skipping invalid data point at index ${i} for symbol ${symbol}`);
        continue;
      }
      
      const timestamp = data.t[i] * 1000; // Convert to milliseconds
      const date = new Date(timestamp);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i]
      });
    }
    
    // Sort by date, most recent first
    historicalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return historicalData;
  } catch (error) {
    console.error(`Error fetching ${interval} data:`, error);
    return generateRandomHistoricalData(symbol);
  }
}