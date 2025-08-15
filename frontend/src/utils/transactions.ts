import type { ITransaction } from "../types/Transactions";

export const groupTransactionsByDate = (transactions: ITransaction[]) => {
  const grouped: { [key: string]: ITransaction[] } = {};

  transactions?.forEach((transaction) => {
    const date = new Date(transaction.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(transaction);
  });

  // Sort dates in descending order
  return Object.entries(grouped).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );
};
