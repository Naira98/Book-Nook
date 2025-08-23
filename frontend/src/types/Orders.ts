export interface AllOrdersResponse {
  orders: Order[];
  return_orders: ReturnOrder[];
}

interface Book {
  id: number;
  title: string;
  price: string;
  cover_img: string;
}

interface BookDetails {
  id: number;
  status: string;
  book: Book;
}

interface BorrowOrderBookDetail {
  id: number;
  borrowing_weeks: number;
  borrow_book_problem: BorrowBookProblem;
  borrow_fees: string;
  actual_return_date?: string | null;
  expected_return_date?: string | null;
  deposit_fees: string;
  deposit_fees_per_day: string;
  return_order_id?: number | null;
  original_book_price: string;
  book_details: BookDetails;
  promo_code_discount: string;
}

interface PurchaseOrderBookDetail {
  id: number;
  quantity: number;
  paid_price_per_book: string;
  book_details: BookDetails;
  promo_code_discount_per_book: string;
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

export enum BorrowBookProblem {
  LOST = "LOST",
  DAMAGED = "DAMAGED",
  NORMAL = "NORMAL",
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

export interface UserOrder {
  id: number;
  created_at: Date;
  address: string;
  pickup_date?: string;
  status: string;
  phone_number: string;
  delivery_fees?: string;
  promo_code_id?: number;
  pickup_type: PickUpType;
  borrow_order_books_details: BorrowOrderBookDetail[];
  purchase_order_books_details: PurchaseOrderBookDetail[];
  total_price: string;
}

export interface UserReturnOrder {
  id: number;
  created_at: Date;
  address?: string;
  phone_number?: string;
  status: ReturnOrderStatus;
  delivery_fees?: string;
  pickup_type: PickUpType;
  courier_id: number | null;
  borrow_order_books_details: BorrowOrderBookDetail[];
  total_price: string;
}

export interface UserOrderesResponse {
  orders: UserOrder[];
}

export interface UserReturnOrderResponse {
  return_orders: UserReturnOrder[];
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
