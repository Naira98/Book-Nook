import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export type Recommendation = {
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  reason: string;
  cover_img: string; 
  description: string;
  available_stock: number;
};

type RecommendResponse = {
  status: string;
  recommendations: Recommendation[] ;
  interests: string;
};

export function useRecommendations() {
  const { data, isPending, error } = useQuery<Recommendation[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      // Call backend GET endpoint that uses the current user's saved interests
      try {
        const rec: RecommendResponse = await apiReq(
          "GET",
          "/interests/recommend",
        );

        // Support both shapes:
        // 1) { recommendations: { recommendations: [...] } }
        // 2) { recommendations: [...] }
        const maybeNested = (rec as any)?.recommendations;
        if (Array.isArray(maybeNested)) return maybeNested as Recommendation[];
        if (
          maybeNested &&
          Array.isArray((maybeNested as any).recommendations)
        ) {
          return (maybeNested as any).recommendations as Recommendation[];
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  return { recommendations: data ?? [], isPending, error };
}