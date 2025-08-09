import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IBookDetailsForUpdate } from "../../types/staff/CreateBookData";

export const useGetBookDetailsForUpdate = (bookId: string) => {
  const {
    data: bookDetailsForUpdate,
    isPending,
    isError,
  } = useQuery<IBookDetailsForUpdate>({
    queryKey: ["bookDetailsForUpdate", bookId],
    queryFn: async () => {
      return await apiReq("GET", `/books/${bookId}/details`);
    },
  });

  return { bookDetailsForUpdate, isPending, isError };
};
