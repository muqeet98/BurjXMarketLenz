// src/hooks/useCoinData.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchCoins, fetchCoinOHLC, fetchFeaturedCoins, fetchTopGainers, fetchTopLosers } from '../services/api';
import { TabType } from '../types';

export const useCoinList = (tabType: TabType, pageSize: number = 10) => {
  const fetchFunction = (pageParam: number) => {
    console.log("pageParampageParam",pageParam);
    
    switch (tabType) {
      case 'Featured':
        return fetchFeaturedCoins('usd', pageParam, pageSize);
      case 'Top Gainers':
        return fetchTopGainers('usd', pageParam, pageSize);
      case 'Top Losers':
        return fetchTopLosers('usd', pageParam, pageSize);
      default:
        return fetchFeaturedCoins('usd', pageParam, pageSize);
    }
  };

  return useInfiniteQuery({
    queryKey: ['coins', tabType],
    queryFn: ({ pageParam = 1 }) => fetchFunction(pageParam),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.success || !lastPage.data || lastPage.data.length < pageSize) {
        return undefined;
      }
      return pages.length + 1;
    },
    initialPageParam: 1
  });
};

export const useCoinChart = (coinId: string, days: '1' | '7' | '30' | '365' | 'max' = '30') => {
  return useQuery({
    queryKey: ['coinChart', coinId, days],
    queryFn: () => fetchCoinOHLC(coinId, days),
    enabled: !!coinId,
  });
};