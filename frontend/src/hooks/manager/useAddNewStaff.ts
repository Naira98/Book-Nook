import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { AddNewUserFormValues } from "../../types/auth";
import { useNavigate } from "react-router-dom";

export function useAddNewStaff() {
  const navigate = useNavigate();

  const { mutate: addNewStaff, isPending } = useMutation({
    mutationFn: async (values: AddNewUserFormValues) => {
      return await apiReq("POST", "/manager/add-user", values);
    },
    onSuccess: (data) => {
      navigate("/manager/users/list-all-users");
      toast(data.message, { type: "success" });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { addNewStaff, isPending };
}
