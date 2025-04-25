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

// Replace with your Alpha Vantage API key
const API_KEY = "demo"; // Using demo key - for production use your own API key

// Base URLs
const BASE_URL = "https://www.alphavantage.co/query";

// Mock data for demo purposes
const MOCK_TRENDING_STOCKS: StockData[] = [
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
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    price: 292.16,
    change: -1.24,
    changePercent: -0.42,
    volume: 6432198,
    marketCap: 586000000000,
    high: 294.53,
    low: 291.02,
    open: 293.45,
    previousClose: 293.40,
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    price: 79.54,
    change: 0.86,
    changePercent: 1.09,
    volume: 9876543,
    marketCap: 642000000000,
    high: 79.98,
    low: 78.87,
    open: 78.92,
    previousClose: 78.68,
  },
  {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    price: 686.32,
    change: 12.84,
    changePercent: 1.91,
    volume: 4327865,
    marketCap: 298000000000,
    high: 689.45,
    low: 675.21,
    open: 675.32,
    previousClose: 673.48,
  },
  {
    symbol: "PYPL",
    name: "PayPal Holdings, Inc.",
    price: 62.35,
    change: -1.23,
    changePercent: -1.93,
    volume: 10765432,
    marketCap: 66700000000,
    high: 63.87,
    low: 61.98,
    open: 63.42,
    previousClose: 63.58,
  },
  {
    symbol: "DIS",
    name: "The Walt Disney Company",
    price: 98.76,
    change: 0.54,
    changePercent: 0.55,
    volume: 7654321,
    marketCap: 180000000000,
    high: 99.32,
    low: 98.01,
    open: 98.23,
    previousClose: 98.22,
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices, Inc.",
    price: 165.23,
    change: 5.87,
    changePercent: 3.68,
    volume: 35789123,
    marketCap: 267000000000,
    high: 167.45,
    low: 160.34,
    open: 160.56,
    previousClose: 159.36,
  },
  {
    symbol: "SBUX",
    name: "Starbucks Corporation",
    price: 96.32,
    change: -0.76,
    changePercent: -0.78,
    volume: 6543210,
    marketCap: 109000000000,
    high: 97.43,
    low: 95.87,
    open: 97.12,
    previousClose: 97.08,
  },
  {
    symbol: "INTC",
    name: "Intel Corporation",
    price: 30.75,
    change: -0.45,
    changePercent: -1.44,
    volume: 28765432,
    marketCap: 130000000000,
    high: 31.24,
    low: 30.42,
    open: 31.01,
    previousClose: 31.20,
  }
];

// Mock historical data for demo purposes
export function generateMockHistoricalData(
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
    // In a real app, you'd use this to fetch from Alpha Vantage
    // const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    // const response = await fetch(url);
    // const data = await response.json();
    
    // For demo purposes, use mock data
    const stock = MOCK_TRENDING_STOCKS.find(
      (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
    );
    
    if (!stock) {
      // Create a new random stock if not found in mocks
      const price = Math.random() * 500 + 50;
      const change = (Math.random() - 0.5) * 10;
      return {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Inc.`,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / price * 100).toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      };
    }
    
    return stock;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

// Search for stocks by keyword
export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  
  try {
    // In a real app, you'd use:
    // const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`;
    // const response = await fetch(url);
    // const data = await response.json();
    
    // For demo purposes, filter mock data
    const results = MOCK_TRENDING_STOCKS
      .filter(
        (stock) =>
          stock.symbol.toUpperCase().includes(query.toUpperCase()) ||
          stock.name.toUpperCase().includes(query.toUpperCase())
      )
      .map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        type: "Equity",
        region: "United States",
        currency: "USD",
      }));
    
    return results;
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

// Get trending stocks
export async function getTrendingStocks(): Promise<StockData[]> {
  console.log("getTrendingStocks called")
  console.log("MOCK_TRENDING_STOCKS:", MOCK_TRENDING_STOCKS)
  
  // In a real app, you'd fetch this data from an API
  // For demo purposes, return mock data with a slight delay to simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Returning mock trending stocks:", MOCK_TRENDING_STOCKS)
      resolve(MOCK_TRENDING_STOCKS);
    }, 500);
  });
}

// Get historical data for a stock
export async function getHistoricalData(
  symbol: string,
  interval: "daily" | "weekly" | "monthly" = "daily"
): Promise<StockHistoricalData[]> {
  try {
    // In a real app, you'd use:
    // const func = interval === "daily" ? "TIME_SERIES_DAILY" : interval === "weekly" ? "TIME_SERIES_WEEKLY" : "TIME_SERIES_MONTHLY";
    // const url = `${BASE_URL}?function=${func}&symbol=${symbol}&apikey=${API_KEY}`;
    // const response = await fetch(url);
    // const data = await response.json();

    // For demo purposes, generate mock data
    const days = interval === "daily" ? 30 : interval === "weekly" ? 52 : 24;
    return generateMockHistoricalData(symbol, days);
  } catch (error) {
    console.error(`Error fetching ${interval} data:`, error);
    return [];
  }
} 