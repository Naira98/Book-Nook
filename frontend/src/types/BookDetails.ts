export interface IPurchaseBookDetails {
  book_details_id: number;
  title: string;
  description: string;
  cover_img: string;
  publish_year: number;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  available_stock: number;
  book_id: number;
  price: string;
  rating: string;
}

export interface IBorrowBookDetails
  extends Omit<IPurchaseBookDetails, "price"> {
  borrow_fees_per_week: string;
  deposit_fees: string;
}
