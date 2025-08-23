export interface OrderStats {
  total_orders: number;
  orders_by_status: { [key: string]: number };
  orders_by_pickup_type: { [key: string]: number };
  total_delivery_fees: number;
}

export interface ReturnOrderStats {
  total_return_orders: number;
  return_orders_by_status: { [key: string]: number };
  lost_books: number;
  damaged_books: number;
}

export interface FinancialStats {
  total_purchase_revenue: number;
  total_borrowing_revenue: number;
  total_delivery_revenue: number;
  total_promo_code_discounts: number;
  total_wallet_deposits: number;
  total_wallet_withdrawals: number;
  total_current_wallet_balance: number;
}

export interface LowStockBook {
  title: string;
  available_stock: number;
}

export interface TopBook {
  title: string;
  total_sold_quantity?: number; // For bestselling
  total_borrows?: number; // For most borrowed
}

export interface InventoryStats {
  total_books: number;
  books_by_status: { [key: string]: number };
  low_stock_books: LowStockBook[];
  top_5_bestselling_books: TopBook[];
  top_5_most_borrowed_books: TopBook[];
}

export interface UserStats {
  total_users: number;
  users_by_role: { [key: string]: number };
  users_by_status: { [key: string]: number };
}

export interface ManagerDashboardStats {
  order_stats: OrderStats;
  return_order_stats: ReturnOrderStats;
  financial_stats: FinancialStats;
  inventory_stats: InventoryStats;
  user_stats: UserStats;
}
