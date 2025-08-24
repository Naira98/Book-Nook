// types/book.ts

export interface SimpleBook {
  id: number;
  title: string;
  price: string;
  cover_img: string;
  publish_year: number;
  rating: string;
  author_name: string;
  category_name: string;
  book_details_id: number;
}

export interface BestSellerBook {
  book: SimpleBook;
  total_count: number;
}

export interface BestSellersResponse {
  borrow_books: BestSellerBook[];
  purchase_books: BestSellerBook[];
  last_updated: string;
}
