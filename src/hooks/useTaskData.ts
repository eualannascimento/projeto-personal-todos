import { useState, useEffect, useCallback } from 'react';
import type { SyncData } from '../types/task';
import sampleData from '../data/sample.json';

const DATA_URL = './data/tasks.json';

export function useTaskData() {
  const [data, setData] = useState<SyncData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(DATA_URL, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Dados nao encontrados. Use os dados de exemplo.');
      }

      const jsonData: SyncData = await response.json();
      setData(jsonData);
    } catch {
      // Se falhar, usa dados de exemplo
      console.log('Usando dados de exemplo');
      setData(sampleData as SyncData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
}
