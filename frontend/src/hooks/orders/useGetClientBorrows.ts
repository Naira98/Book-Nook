import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IClientBorrows } from "../../types/ReturnOrder";
import { useGetMe } from "../auth/useGetMe";

export const useGetClientBorrows = () => {
  const { me } = useGetMe();

  const { data: clientBorrows, isPending } = useQuery<IClientBorrows[]>({
    queryKey: ["clientBorrows", me!.id],
    queryFn: async () => {
      return await apiReq("GET", "/return-order/client-borrows");
    },
  });

  return { clientBorrows, isPending };
};
