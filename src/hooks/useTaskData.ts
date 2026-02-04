import { useState, useEffect, useCallback } from 'react';
import type { SyncData } from '../types/task';
import sampleData from '../data/sample.json';

const DATA_URL = './data/tasks.json';

export function useTaskData() {
  const [data, setData] = useState<SyncData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(DATA_URL, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Dados nao encontrados');
      }

      const jsonData: SyncData = await response.json();

      if (!jsonData.tasks || jsonData.tasks.length === 0) {
        throw new Error('Nenhuma tarefa encontrada');
      }

      setData(jsonData);
      setIsSample(false);
    } catch {
      setData(sampleData as SyncData);
      setIsSample(true);
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
    isSample,
    refresh
  };
}
