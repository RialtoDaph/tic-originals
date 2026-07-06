import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DEFAULT_COLLECTION = '001';

export function useCurrentCollection() {
  const { data } = useQuery({
    queryKey: ['site-setting', 'current_collection'],
    queryFn: async () => {
      const rows = await base44.entities.SiteSetting.filter({ key: 'current_collection' });
      return rows[0]?.value || DEFAULT_COLLECTION;
    },
    staleTime: 60_000,
  });
  return data || DEFAULT_COLLECTION;
}