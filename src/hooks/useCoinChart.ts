// src/hooks/useCoinChart.ts
import { useQuery } from '@tanstack/react-query';
import api from '../apis/api';

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const useCoinChart = (productId: number, days: number) =>
  useQuery<OHLCData[]>({
    queryKey: ['coinChart', productId, days],
    queryFn: async () => {
      const { data } = await api.get<OHLCData[]>('/coin-ohlc', {
        params: { productId, days },
      });
      return data;
    },
    refetchInterval: 20000,
  });
