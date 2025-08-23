import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { ManagerDashboardStats } from "../../types/Dashboard";

export function useGetManagerDashboardStats() {
  const {
    data: dashboardStats,
    isPending,
    error,
  } = useQuery<ManagerDashboardStats, Error>({
    queryKey: ["managerDashboardStats"],
    queryFn: async () => {
      const response = await apiReq("GET", "/manager/dashboard-stats");
      return response as ManagerDashboardStats;
    },
  });

  return { dashboardStats, isPending, error };
}
