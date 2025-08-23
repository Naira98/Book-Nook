import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { ITransaction } from "../../types/Transactions";

export const useGetTransactions = (user_id: number) => {
  const { data: transactions, isPending } = useQuery<ITransaction[]>({
    queryKey: ["transactions", user_id],
    queryFn: async () => await apiReq("GET", "/wallet/transactions"),
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  return {
    transactions,
    isPending,
  };
};
