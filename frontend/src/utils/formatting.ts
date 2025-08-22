import Decimal from "decimal.js";

export const formatClock = (date: Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const fromatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(dateString))
    .replace(",", "");
};

export const formatMoney = (money: string) => {
  const decimalMoney = new Decimal(money);
  return decimalMoney.toFixed(2);
};
