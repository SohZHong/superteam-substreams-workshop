'use client';

import { useEffect, useState } from 'react';

const useSubstreams = () => {
  const [blocks, setBlocks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>();

  useEffect(() => {
    const eventSource = new EventSource('/api/substreams/start');

    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.error) {
        setError(parsedData.error);
      } else {
        setBlocks((prev) => [...prev, JSON.stringify(parsedData)]);
        setCursor(parsedData.cursor);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { blocks, cursor, error };
};

export default useSubstreams;
