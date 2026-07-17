"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export type Holding = {
  id: string;
  tradingCode: string;
  quantity: number;
  boughtPrice: number;
  notifyPrice: number | 0;
  // Computed fields (we'll fetch market data in dashboard)
  currentLTP: number;
  currentHIGH: number;
  currentLOW: number;
  targetPrice: number; // legacy map
  sector?: string;
  todayChange: number;
  purchaseDate?: string;
  broker?: string;
  notes?: string;
}

type PortfolioContextType = {
  holdings: Holding[];
  setHoldings: (holdings: Holding[]) => void;
  isLoaded: boolean;
  addHolding: (holding: Partial<Holding>) => Promise<void>;
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>;
  deleteHolding: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = async () => {
    if (status !== "authenticated") return;
    try {
      const [portRes, marketRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/market')
      ]);

      if (portRes.ok && marketRes.ok) {
        const portData = await portRes.json();
        const marketData = await marketRes.json();

        const enriched = (portData.portfolio || []).map((item: any) => {
          const m = marketData.shares?.find((s: any) => s.tradingCode === item.tradingCode);
          // console.log(m);
          return {
            ...item,
            currentLTP: m ? m.ltp : item.boughtPrice,
            currentHIGH: m ? m.high : item.boughtPrice,
            currentLOW: m ? m.low : item.boughtPrice,
            todayChange: m ? parseFloat(m.change) : 0,
            targetPrice: item.notifyPrice || 0, // legacy map
          };
        });

        setHoldings(enriched);
      } else if (portRes.ok) {
        const portData = await portRes.json();
        setHoldings(portData.portfolio || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      setHoldings([]);
      setIsLoaded(true);
    } else if (status === "authenticated") {
      refresh();
    }
  }, [status]);

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addHolding = async (holding: Partial<Holding>) => {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holding)
      });
      if (res.ok) {
        await refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <PortfolioContext.Provider value={{ holdings, setHoldings, isLoaded, addHolding, updateHolding, deleteHolding, refresh }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
