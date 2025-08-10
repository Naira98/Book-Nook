import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IBookDetailsForUpdate } from "../../types/staff/CreateBookData";
import apiReq from "../../services/apiReq";
import { toast } from "react-toastify";
import type { IBookTable } from "../../types/BookTable";

// Update the type to include the context of the mutation
type UpdateBookInput =
  | { id: number; formData: FormData }
  | IBookDetailsForUpdate;

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  const { mutate: updateBook, isPending } = useMutation({
    mutationFn: async (bookData: UpdateBookInput) => {
      if ("formData" in bookData) {
        // This is an image update
        return await apiReq(
          "PATCH",
          `/books/${bookData.id}/image`,
          bookData.formData,
        );
      } else {
        // This is a standard book details update
        return await apiReq("PATCH", `/books/${bookData.id}`, bookData);
      }
    },
    onSuccess: (book: IBookDetailsForUpdate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookDetailsForUpdate", book.id],
      });

      queryClient.setQueryData(
        ["allBooksTable"],
        (oldData: IBookTable[] | undefined) => {
          if (!oldData) {
            return [];
          }

          return oldData.map((item) => {
            if (item.id === book.id) {
              return {
                ...item,
                title: book.title ?? item.title,
                price: book.price ? String(book.price) : item.price,
                available_stock_purchase:
                  book.purchase_available_stock ??
                  item.available_stock_purchase,
                available_stock_borrow:
                  book.borrow_available_stock ?? item.available_stock_borrow,
              };
            }
            return item;
          });
        },
      );

      // Check if the mutation was for an image update to show a specific toast
      if ("formData" in variables) {
        toast(`Image for book updated successfully! 🖼️`, { type: "success" });
      } else {
        toast(`Book ${book.title} updated successfully!`, {
          type: "success",
        });
      }
    },
    onError: (error) => {
      console.error("Error updating book:", error);
      toast("Failed to update book. Please try again. 😔", { type: "error" });
    },
  });

  return { updateBook, isPending };
};
