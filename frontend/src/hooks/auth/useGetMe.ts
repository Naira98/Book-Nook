import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";

export const useGetMe = () => {
  const {
    data: me,
    isPending,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      return await apiReq("GET", "/auth/me");
    },
    retry: false,
  });

  return { me, isPending, error };
};
