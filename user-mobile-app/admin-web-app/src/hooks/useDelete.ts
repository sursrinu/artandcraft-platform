import { useState } from 'react';

interface UseDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDelete = (deleteFn: (id: number) => Promise<void>, options: UseDeleteOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteFn(id);
      options.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Delete failed';
      setError(errorMessage);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleDelete };
};
