import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { Category } from "../../types/client/books";
import type { ICreateAuthorCategoryData } from "../../types/staff/staffBookTypes";

export const useAddCategory = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async (categoryData: ICreateAuthorCategoryData) => {
      return await apiReq("POST", "/books/categories", categoryData);
    },
    onSuccess: (newCategory: Category) => {
      const oldCategories = queryClient.getQueryData(["categories"]);

      if (oldCategories) {
        queryClient.setQueryData(
          ["categories"],
          (oldCategories: Category[] | undefined) => {
            return oldCategories
              ? [...oldCategories, newCategory]
              : [newCategory];
          },
        );
      }

      toast(`Category "${newCategory.name}" created successfully!`, {
        type: "success",
      });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        (error as Error).message || "Failed to create category.";
      console.error("Error creating category:", error);
      toast(errorMessage, {
        type: "error",
      });
    },
  });

  return { addCategory, isPending };
};
