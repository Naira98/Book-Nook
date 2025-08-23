import { useMutation } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export const useAddInterests = () => {
  const { mutate: addInterests, isPending } = useMutation({
    mutationFn: async (interests: string[]) => {
      return await apiReq("POST", "/interests", { interests });
    },
  });

  return { addInterests, isPending };
};
