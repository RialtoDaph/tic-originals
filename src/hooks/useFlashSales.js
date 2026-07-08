import { useQuery } from '@tanstack/react-query';
import { getActiveFlashSales } from '@/functions/getActiveFlashSales';

// Shared hook so every card / page fetches the active flash-sale list once
// (React Query dedupes concurrent calls to the same key).
export function useFlashSales() {
  return useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => getActiveFlashSales({}).then((res) => res.data.flashSales || []),
    // Refresh every 5 minutes so sales that expire during a session drop off.
    staleTime: 5 * 60 * 1000,
  });
}