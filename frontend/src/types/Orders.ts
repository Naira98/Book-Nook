export interface AllOrdersResponse {
  orders: Order[];
  return_orders: ReturnOrder[];
}

interface Book {
  id: number;
  title: string;
  price: string;
}

interface BookDetails {
  id: number;
  book: Book;
}

interface BorrowOrderBookDetail {
  id: number;
  borrowing_weeks: number;
  deposit_fees: string;
  borrow_fees: string;
  book_details: BookDetails;
}

interface PurchaseOrderBookDetail {
  id: number;
  quantity: number;
  paid_price_per_book: string;
  book_details: BookDetails;
}

export interface User {
  first_name: string;
  last_name: string;
  email: string;
}

export enum PickUpType {
  COURIER = "COURIER",
  SITE = "SITE",
}

export enum OrderStatus {
  CREATED = "CREATED",
  ON_THE_WAY = "ON_THE_WAY",
  PICKED_UP = "PICKED_UP",
  PROBLEM = "PROBLEM",
}

export enum ReturnOrderStatus {
  CREATED = "CREATED",
  ON_THE_WAY = "ON_THE_WAY",
  PICKED_UP = "PICKED_UP",
  CHECKING = "CHECKING",
  DONE = "DONE",
  PROBLEM = "PROBLEM",
}

export interface CreateOrderRequest {
  pickup_type: PickUpType;
  address: string;
  phone_number: string;
  promo_code_id: number | undefined;
}

export interface Order {
  id: number;
  created_at: string;
  address: string;
  pickup_type: string;
  phone_number: string;
  user: User;
  number_of_books: number;
  pickup_date?: string;
  status: OrderStatus;
  courier_id: number | null;
  borrow_order_books_details: BorrowOrderBookDetail[];
  purchase_order_books_details: PurchaseOrderBookDetail[];
}

export interface ReturnOrder {
  id: number;
  created_at: string;
  address: string;
  pickup_type: string;
  phone_number: string;
  user: User;
  number_of_books: number;
  status: ReturnOrderStatus;
  courier_id: number | null;
  borrow_order_books_details: BorrowOrderBookDetail[];
}

export type changeOrderStatusRequest = {
  order_id: number;
  status: OrderStatus;
};

export type changeRetrunOrderStatusRequest = {
  return_order_id: number;
  status: ReturnOrderStatus;
  courier_id: number | null;
};
