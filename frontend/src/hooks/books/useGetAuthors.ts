import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export const useGetAuthors = () => {
  const {
    data: authors,
    isPending,
    error,
  } = useQuery({
    queryKey: ["authors"],
    queryFn: async () => await apiReq("GET", "/books/authors"),
  });

  return { authors, isPending, error };
};
