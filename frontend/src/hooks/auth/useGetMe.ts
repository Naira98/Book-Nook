import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IUser } from "../../types/User";

export const useGetMe = () => {
  const {
    data: me,
    isPending,
    error,
  } = useQuery<IUser>({
    queryKey: ["me"],
    queryFn: async () => {
      return await apiReq("GET", "/auth/me");
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { me, isPending, error };
};
