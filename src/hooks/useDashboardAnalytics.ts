/**
 * useDashboardAnalytics
 * =====================
 * React Query hook that fetches student dashboard analytics
 * from the backend. Caches for 2 minutes and retries once.
 * Returns { data, isLoading, isError, error, refetch }.
 */

import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, type DashboardAnalytics } from "@/lib/api/analytics";

export function useDashboardAnalytics(studentId: string | undefined) {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics", studentId],
    queryFn: () => getDashboardAnalytics(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,     // consider fresh for 2 minutes
    gcTime: 5 * 60 * 1000,        // keep in cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
