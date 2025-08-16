import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateBook as updateBookApi } from "../../services/book";
import type { IBookTable } from "../../types/BookTable";

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  const { mutate: updateBook, isPending } = useMutation({
    mutationFn: updateBookApi,
    onSuccess: (book: IBookTable) => {
      const oldData = queryClient.getQueryData(["allBooksTable"]);

      if (oldData) {
        queryClient.setQueryData(
          ["allBooksTable"],
          (oldData: IBookTable[] | undefined) => {
            if (oldData)
              return oldData.map((b) => (b.id === book.id ? book : b));
          },
        );
      }

      toast(`Book ${book.title} updated successfully!`, { type: "success" });
    },
    onError: (error) => {
      console.error("Error updating book:", error);
      toast("Failed to update book. Please try again.", { type: "error" });
    },
  });

  return { updateBook, isPending };
};
