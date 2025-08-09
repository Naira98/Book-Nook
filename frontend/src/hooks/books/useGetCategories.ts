import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export const useGetCategories = () => {
  const {
    data: categories,
    isPending,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await apiReq("GET", "/books/categories"),
  });

  return { categories, isPending, error };
};
