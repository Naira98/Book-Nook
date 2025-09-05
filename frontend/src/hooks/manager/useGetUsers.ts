import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IUser } from "../../types/User.ts";

export const useGetUsers = () => {
  const { data: users, isPending } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: async () => await apiReq("GET", "/manager/get-all-users"),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    users,
    isPending,
  };
};
