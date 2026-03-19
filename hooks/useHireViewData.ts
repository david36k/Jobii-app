import { useMemo } from 'react';
import type { User } from '@/types';
import type { Tender } from '@/types';

export function useHireViewData(currentUser: User | null, tenders: Tender[]) {
  const myTenders = useMemo(() => {
    if (!currentUser) return [];
    return tenders.filter((t) => t.organizerId === currentUser.id);
  }, [currentUser, tenders]);

  // Tender creation costs 2 credits. Warn below 5, block below 2.
  const hasLowCredits = currentUser && currentUser.credits > 0 && currentUser.credits < 5;
  const hasNoCredits = currentUser && currentUser.credits < 2;

  return { myTenders, hasLowCredits: !!hasLowCredits, hasNoCredits: !!hasNoCredits };
}
