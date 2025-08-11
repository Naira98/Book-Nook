import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { Author } from "../../types/client/books";
import type { ICreateAuthorCategoryData } from "../../types/staff/staffBookTypes";

export const useAddAuthor = () => {
  const queryClient = useQueryClient();

  const { mutate: addAuthor, isPending } = useMutation({
    mutationFn: async (authorData: ICreateAuthorCategoryData) => {
      return await apiReq("POST", "/books/authors", authorData);
    },
    onSuccess: (newAuthor: Author) => {
      const oldAuthors = queryClient.getQueryData(["authors"]);

      if (oldAuthors) {
        queryClient.setQueryData(
          ["authors"],
          (oldAuthors: Author[] | undefined) => {
            return oldAuthors ? [...oldAuthors, newAuthor] : [newAuthor];
          },
        );
      }

      toast(`Author "${newAuthor.name}" created successfully!`, {
        type: "success",
      });
    },
    onError: (error) => {
      const errorMessage =
        (error as Error).message || "Failed to create author.";
      console.error("Error creating author:", error);
      toast(errorMessage, {
        type: "error",
      });
    },
  });

  return { addAuthor, isPending };
};
