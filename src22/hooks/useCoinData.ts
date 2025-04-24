import { useState, useEffect, useCallback } from 'react';
import { Coin, OHLCData, CategoryType, TimeRangeType } from '../types';
import { fetchCoins, fetchCoinOHLC } from '../apis/client';

export const useCoinsList = (category: CategoryType = 'featured') => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const loadCoins = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      const currentPage = refresh ? 1 : page;
      const data = await fetchCoins(currentPage, pageSize);
      console.log("datadatadatadatadatadata",data);
      
      let sortedData = [...data];
      
      // Sort based on category
      if (category === 'gainers') {
        sortedData = sortedData.sort((a, b) => 
          b.price_change_percentage_24h - a.price_change_percentage_24h
        );
      } else if (category === 'losers') {
        sortedData = sortedData.sort((a, b) => 
          a.price_change_percentage_24h - b.price_change_percentage_24h
        );
      } else {
        // 'featured' - already sorted by market cap in the API
      }
      
      // Take top 20 for each category
      sortedData = sortedData.slice(0, 20);
      
      if (refresh) {
        setCoins(sortedData);
        setPage(2);
      } else {
        setCoins(prevCoins => [...prevCoins, ...sortedData]);
        setPage(prevPage => prevPage + 1);
      }
      
      setHasMore(data.length === pageSize);
    } catch (err) {
      setError('Failed to load coins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, page, pageSize]);

  useEffect(() => {
    loadCoins(true);
  }, [category]);

  const refresh = () => loadCoins(true);
  const loadMore = () => {
    if (!loading && hasMore) {
      loadCoins();
    }
  };

  return { coins, loading, error, refresh, loadMore, hasMore };
};

export const useCoinDetails = (coinId: string, timeRange: TimeRangeType = '1') => {
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOHLCData = async () => {
      try {
        setLoading(true);
        const data = await fetchCoinOHLC('2', timeRange);
        console.log("fetchCoinOHLC2323",data);
        
        setOhlcData(data);
      } catch (err) {
        setError('Failed to load coin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOHLCData();
  }, [coinId, timeRange]);

  return { ohlcData, loading, error };
};
