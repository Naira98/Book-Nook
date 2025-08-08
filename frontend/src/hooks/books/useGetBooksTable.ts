import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IBookTable } from "../../types/BookTable";

export const useGetBooksTable = () => {
  const {
    data: books,
    isPending,
    error,
  } = useQuery<IBookTable[]>({
    queryKey: ["allBooksTable"],
    queryFn: async () => {
      return await apiReq("GET", `/books/table`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { books, isPending, error };
};
