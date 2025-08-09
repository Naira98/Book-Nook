export interface AllOrdersResponse {
  orders: Order[];
  return_orders: ReturnOrder[];
}

export interface User {
  first_name: string;
  last_name: string;
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

export interface Order {
  id: number;
  created_at: string;
  address: string;
  pick_up_type: string;
  phone_number: string;
  user: User;
  number_of_books: number;
  pick_up_date?: string;
  status: OrderStatus;
  courier_id: number | null;
}

export interface ReturnOrder {
  id: number;
  created_at: string;
  address: string;
  pick_up_type: string;
  phone_number: string;
  user: User;
  number_of_books: number;
  status: ReturnOrderStatus;
  courier_id: number | null;
}

export type changeOrderStatusRequest = {
  order_id: number;
  status: OrderStatus;
};
