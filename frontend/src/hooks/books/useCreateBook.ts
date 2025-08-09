import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook as createBookApi } from "../../services/createBook";
import { toast } from "react-toastify";
import type { IBookTable } from "../../types/BookTable";

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  const { mutate: createBook, isPending } = useMutation({
    mutationFn: createBookApi,
    onSuccess: (newBook: IBookTable) => {
      queryClient.setQueryData(
        ["allBooksTable"],
        (oldData: IBookTable[] | undefined) => {
          return oldData ? [...oldData, newBook] : [newBook];
        },
      );
      toast(`Book ${newBook.title} created successfully!`, {
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      toast("Failed to create book.", {
        type: "error",
      });
    },
  });

  return { createBook, isPending };
};
