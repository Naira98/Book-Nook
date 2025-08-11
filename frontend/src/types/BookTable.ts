export type IBookTable = {
  id: number;
  title: string;
  price: string;
  author_name: string;
  category_name: string;
  available_stock_purchase: number;
  available_stock_borrow: number;
};

export enum FilterAvailability {
  All = "All",
  PurchaseInStock = "PurchaseInStock",
  PurchaseOutOfStock = "PurchaseOutOfStock",
  BorrowInStock = "BorrowInStock",
  BorrowOutOfStock = "BorrowOutOfStock",
}

export interface AvailabilityOption {
  value: FilterAvailability;
  label: string;
}
