import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiReq from '../services/apiReq';
import type { Book } from '../types/client/books';

export const useBook = (bookId: string | undefined) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch book details
  const {
    data: book,
    isLoading,
    error,
    refetch,
    isError,
    isFetching
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async (): Promise<Book> => {
      if (!bookId) throw new Error('Book ID is required');
      return await apiReq('GET', `/books/${bookId}`);
    },
    enabled: !!bookId,
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
  });

  // Borrow book mutation
  const borrowMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return await apiReq('POST', `/books/${bookId}/borrow`);
    },
    onSuccess: () => {
      // Invalidate and refetch book data to update availability
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      // Navigate to borrow books page
      navigate('/borrow-books');
      // You can add toast notification here
    },
    onError: (error) => {
      console.error('Failed to borrow book:', error);
      // You can add toast notification here
    },
    retry: 2, // Retry failed mutations up to 2 times
  });

  // Purchase book mutation
  const purchaseMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return await apiReq('POST', `/books/${bookId}/purchase`);
    },
    onSuccess: () => {
      // Invalidate and refetch book data to update availability
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      // Navigate to purchase books page
      navigate('/purchase-books');
      // You can add toast notification here
    },
    onError: (error) => {
      console.error('Failed to purchase book:', error);
      // You can add toast notification here
    },
    retry: 2, // Retry failed mutations up to 2 times
  });

  return {
    book,
    isLoading,
    error,
    refetch,
    borrowMutation,
    purchaseMutation,
    isError,
    isFetching,
    // Computed properties for better UX
    canBorrow: book?.book_details?.some(detail => 
      detail.status === 'BORROW' && detail.available_stock > 0
    ) ?? false,
    canPurchase: book?.book_details?.some(detail => 
      detail.status === 'PURCHASE' && detail.available_stock > 0
    ) ?? false,
  };
}; 