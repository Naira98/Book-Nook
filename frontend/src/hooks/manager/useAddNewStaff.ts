import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { AddNewUserFormValues } from "../../types/auth";

export function useAddNewStaff(

) {

  const { mutate: addNewStaff, isPending } = useMutation({
    mutationFn: async (values: AddNewUserFormValues) => {
      return await apiReq("POST", "/users/add", values);
    },
    
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { addNewStaff, isPending };
}
