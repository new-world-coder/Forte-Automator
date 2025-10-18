'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

export interface OracleProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
}

// Mock oracle providers - in production these would be real APIs
const ORACLE_PROVIDERS: OracleProvider[] = [
  {
    name: 'Flow Price Oracle',
    endpoint: 'https://api.flow-oracle.com/v1/price',
  },
  {
    name: 'CoinGecko',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price',
  },
  {
    name: 'Chainlink',
    endpoint: 'https://api.chain.link/v1/price',
  },
];

export const usePriceOracle = () => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get price for a specific token
  const getTokenPrice = useCallback(async (symbol: string): Promise<PriceData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check if we already have recent price data (within 5 minutes)
      const existingPrice = prices.get(symbol.toUpperCase());
      if (existingPrice) {
        const lastUpdated = new Date(existingPrice.lastUpdated);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
        
        if (diffMinutes < 5) {
          return existingPrice;
        }
      }

      // Fetch new price data
      const priceData = await fetchTokenPrice(symbol);
      if (priceData) {
        setPrices(prev => new Map(prev).set(symbol.toUpperCase(), priceData));
      }
      return priceData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
      return null;
    } finally {
      setLoading(false);
    }
  }, [prices]);

  // Fetch price for multiple tokens at once
  const getMultiplePrices = useCallback(async (symbols: string[]): Promise<PriceData[]> => {
    setLoading(true);
    setError(null);

    try {
      const pricePromises = symbols.map(symbol => getTokenPrice(symbol));
      const results = await Promise.all(pricePromises);
      return results.filter((price): price is PriceData => price !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getTokenPrice]);

  // Subscribe to price updates (polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (prices.size > 0) {
        const symbols = Array.from(prices.keys());
        await getMultiplePrices(symbols);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prices, getMultiplePrices]);

  return {
    prices,
    loading,
    error,
    getTokenPrice,
    getMultiplePrices,
  };
};

// Helper function to fetch token price from oracles
async function fetchTokenPrice(symbol: string): Promise<PriceData | null> {
  const symbolFormatted = symbol.toUpperCase();
  
  try {
    // Try CoinGecko API first (free tier)
    const coinGeckoId = getCoinGeckoId(symbolFormatted);
    if (coinGeckoId) {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (response.ok) {
          const data = await response.json();
          const tokenData = data[coinGeckoId];
          
          if (tokenData) {
            return {
              symbol: symbolFormatted,
              price: tokenData.usd,
              change24h: tokenData.usd_24h_change || 0,
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      } catch (error) {
        console.warn('CoinGecko API failed, falling back to mock data:', error);
      }
    }
    
    // Fallback to mock data if API fails
    return getMockPriceData(symbolFormatted);
    
  } catch (error) {
    console.error('Failed to fetch price data:', error);
    return getMockPriceData(symbolFormatted);
  }
}

// Map token symbols to CoinGecko IDs
function getCoinGeckoId(symbol: string): string | null {
  const mapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'FLOW': 'flow',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'ADA': 'cardano',
    'SOL': 'solana',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'DOT': 'polkadot',
  };
  
  return mapping[symbol] || null;
}

// Fallback mock data function
function getMockPriceData(symbolFormatted: string): PriceData {
  const mockPrices: Record<string, { price: number; change24h: number }> = {
    'ETH': { price: 1850.50, change24h: -2.5 },
    'BTC': { price: 42500.75, change24h: 1.2 },
    'USDC': { price: 1.00, change24h: 0.01 },
    'FLOW': { price: 0.85, change24h: 5.8 },
    'ADA': { price: 0.35, change24h: -1.2 },
    'SOL': { price: 98.25, change24h: 3.4 },
  };

  const mockData = mockPrices[symbolFormatted] || { price: 1.0, change24h: 0 };
  
  // Add some randomness to simulate price movement
  const randomFactor = 0.98 + Math.random() * 0.04; // ±2% variation
  
  return {
    symbol: symbolFormatted,
    price: mockData.price * randomFactor,
    change24h: mockData.change24h,
    lastUpdated: new Date().toISOString(),
  };
}

// Helper function to check if a condition is met
export function checkPriceCondition(
  symbol: string,
  operator: 'gt' | 'lt' | 'gte' | 'lte',
  targetPrice: number,
  currentPrice: PriceData
): boolean {
  const price = currentPrice.price;
  
  switch (operator) {
    case 'gt':
      return price > targetPrice;
    case 'lt':
      return price < targetPrice;
    case 'gte':
      return price >= targetPrice;
    case 'lte':
      return price <= targetPrice;
    default:
      return false;
  }
}
