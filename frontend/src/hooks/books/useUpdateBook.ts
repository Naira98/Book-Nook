import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IBookDetailsForUpdate } from "../../types/staff/CreateBookData";
import apiReq from "../../services/apiReq";
import { toast } from "react-toastify";

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  const { mutate: updateBook, isPending } = useMutation({
    mutationFn: async (bookData: IBookDetailsForUpdate) =>
      await apiReq("PATCH", `/books/${bookData.id}`, bookData),
    onSuccess: (book: IBookDetailsForUpdate) => {
      queryClient.setQueryData(["bookDetailsForUpdate", book.id], null);
    },
    onError: (error) => {
      console.error("Error updating book:", error);
      toast("Failed to update book. Please try again.", { type: "error" });
    },
  });

  return { updateBook, isPending };
};
