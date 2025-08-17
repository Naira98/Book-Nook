import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBook as addBookApi } from "../../services/book";
import { toast } from "react-toastify";
import type { IBookTable } from "../../types/BookTable";

export const useAddBook = () => {
  const queryClient = useQueryClient();

  const { mutate: addBook, isPending } = useMutation({
    mutationFn: addBookApi,
    onSuccess: (newBook: IBookTable) => {
      const oldData = queryClient.getQueryData(["allBooksTable"]);

      if (oldData != undefined) {
        queryClient.setQueryData(
          ["allBooksTable"],
          (oldData: IBookTable[] | undefined) => {
            return oldData ? [...oldData, newBook] : [newBook];
          },
        );
      }

      toast(`Book ${newBook.title} created successfully!`, {
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      toast(error.message, {
        type: "error",
      });
    },
  });

  return { addBook, isPending };
};
