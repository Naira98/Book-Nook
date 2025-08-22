import type { UserReturnOrder } from "../types/Orders";

export const groupReturnOrdersByDate = (
  userReturnOrders: UserReturnOrder[],
) => {
  const grouped: { [key: string]: UserReturnOrder[] } = {};

  userReturnOrders?.forEach((returnOrder) => {
    const date = new Date(returnOrder.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(returnOrder);
  });

  // Sort dates in descending order
  return Object.entries(grouped).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );
};
