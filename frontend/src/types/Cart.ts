export interface AllCartItemsResponse {
  purchase_items: PurchaseItem[];
  borrow_items: BorrowItem[];
  delivery_fees: string;
  remaining_borrow_books_count: number;
}

export interface PurchaseItem {
  id: number;
  book_details_id: number;
  quantity: number;
  book: Book;
  book_price: string;
}

export interface Book {
  id: number;
  title: string;
  cover_img: string;
  author: Author;
}

export interface Author {
  id: number;
  name: string;
}

export interface BorrowItem {
  id: number;
  book_details_id: number;
  borrowing_weeks: number;
  borrow_fees_per_week: string;
  deposit_fees: string;
  delay_fees_per_day: string;
  book: Book;
}

export interface UpdateCartItemRequest {
  cart_item_id: number;
  quantity?: number;
  borrowing_weeks?: number;
}
