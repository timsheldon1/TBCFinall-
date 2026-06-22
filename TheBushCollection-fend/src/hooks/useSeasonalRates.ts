import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface RateEntry {
  roomType: string;
  roomId?: string;
  sglBB?: number | null;
  dblBB?: number | null;
  sglHB?: number | null;
  dblHB?: number | null;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type MealPlan = 'BB' | 'HB' | 'FB';
export type SeasonType = 'low' | 'high' | 'peak';

export interface SeasonalRate {
  _id: string;
  property: { _id: string; name: string } | string;
  name: string;
  seasonType: SeasonType;
  dateRanges: DateRange[];
  availableMealPlans: MealPlan[];
  rates: RateEntry[];
  minNights: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const SEASON_LABELS: Record<SeasonType, string> = {
  low: 'Low Season',
  high: 'High Season',
  peak: 'Peak Season',
};

export const SEASON_COLORS: Record<SeasonType, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  high: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  peak: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

export const MEAL_PLAN_LABELS: Record<MealPlan, string> = {
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
};

/** Returns the lowest non-null rate in a season (for "from $X" display) */
export function getLowestRate(season: SeasonalRate, mealPlan?: MealPlan): number | null {
  const prices: number[] = [];
  for (const entry of season.rates) {
    if (!mealPlan || mealPlan === 'BB') {
      if (entry.sglBB != null) prices.push(entry.sglBB);
      if (entry.dblBB != null) prices.push(entry.dblBB);
    }
    if (!mealPlan || mealPlan === 'HB') {
      if (entry.sglHB != null) prices.push(entry.sglHB);
      if (entry.dblHB != null) prices.push(entry.dblHB);
    }
  }
  return prices.length ? Math.min(...prices) : null;
}

/** Pick the per-room-per-night price for a given room type, guest count, and meal plan */
export function getSeasonalRoomRate(
  season: SeasonalRate | null,
  roomType: string,
  guests: number,
  mealPlan: MealPlan
): number | null {
  if (!season) return null;
  const entry = season.rates.find(r =>
    r.roomType.trim().toLowerCase() === roomType.trim().toLowerCase()
  );
  if (!entry) return null;
  const isSingle = guests <= 1;
  if (mealPlan === 'BB') return isSingle ? (entry.sglBB ?? null) : (entry.dblBB ?? null);
  if (mealPlan === 'HB') return isSingle ? (entry.sglHB ?? null) : (entry.dblHB ?? null);
  return null;
}

export const useSeasonalRates = (propertyId?: string) => {
  const [rates, setRates] = useState<SeasonalRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (propertyId) params.propertyId = propertyId;
      const res = await api.get('/seasonal-rates', { params });
      setRates(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seasonal rates');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const getRateByDate = async (date: string, propId?: string): Promise<SeasonalRate | null> => {
    try {
      const params: Record<string, string> = { date };
      if (propId) params.propertyId = propId;
      const res = await api.get('/seasonal-rates/by-date', { params });
      return res.data;
    } catch {
      return null;
    }
  };

  const createRate = async (data: Omit<SeasonalRate, '_id' | 'createdAt' | 'updatedAt'>): Promise<SeasonalRate> => {
    const res = await api.post('/seasonal-rates', data);
    setRates(prev => [...prev, res.data]);
    return res.data;
  };

  const updateRate = async (id: string, data: Partial<Omit<SeasonalRate, '_id'>>): Promise<SeasonalRate> => {
    const res = await api.put(`/seasonal-rates/${id}`, data);
    setRates(prev => prev.map(r => r._id === id ? res.data : r));
    return res.data;
  };

  const deleteRate = async (id: string): Promise<void> => {
    await api.delete(`/seasonal-rates/${id}`);
    setRates(prev => prev.filter(r => r._id !== id));
  };

  return { rates, loading, error, fetchRates, getRateByDate, createRate, updateRate, deleteRate };
};
