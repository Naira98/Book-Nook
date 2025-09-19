import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export type Recommendation = {
  id: number;
  title: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  book_details: {
    id: number;
    available_stock: number;
    status: "BORROW" | "PURCHASE";
    book_id: number;
  }[];
  reason: string;
  cover_img: string;
  description: string;
};

type RecommendResponse = {
  status: string;
  recommendations: Recommendation[];
  interests: string;
};

export function useRecommendations() {
  const { data, isPending, error } = useQuery<Recommendation[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      try {
        const rec: RecommendResponse = await apiReq("GET", "/interests");

        // Support both shapes:
        // 1) { recommendations: { recommendations: [...] } }
        // 2) { recommendations: [...] }
        const maybeNested = (rec as RecommendResponse)?.recommendations;
        if (Array.isArray(maybeNested)) return maybeNested as Recommendation[];
        if (
          maybeNested &&
          Array.isArray((maybeNested as RecommendResponse).recommendations)
        ) {
          return (maybeNested as RecommendResponse)
            .recommendations as Recommendation[];
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
    // Lowest priority - should not block other requests
    enabled: true, // Always enabled but with low priority
    gcTime: 1000 * 60 * 30, // 30 minutes - longer cache time
    refetchOnWindowFocus: false, // Don't refetch on focus to reduce load
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  return { recommendations: data ?? [], isPending, error };
}
