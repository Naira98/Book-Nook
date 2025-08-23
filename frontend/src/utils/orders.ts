import type { UserOrder } from "../types/Orders";

export const groupOrdersByDate = (userOrders: UserOrder[]) => {
  const grouped: { [key: string]: UserOrder[] } = {};

  userOrders?.forEach((order) => {
    const date = new Date(order.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(order);
  });

  // Sort dates in descending order
  return Object.entries(grouped).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );
};
