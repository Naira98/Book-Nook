import Decimal from "decimal.js";

export const formatClock = (date: Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatMoeny = (money: string) => {
  const decimalMoney = new Decimal(money);
  return decimalMoney.toFixed(2);
};
