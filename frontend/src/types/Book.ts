interface ICategory {
  id: number;
  name: string;
}
interface IAuthor {
  id: number;
  name: string;
}

export interface IPurchaseBook {
  book_id: number;
  book_details_id: number;
  title: string;
  description: string;
  cover_img: string;
  publish_year: number;
  category: ICategory;
  author: IAuthor;
  available_stock: number;
  price: string;
}

export interface IBorrowBook extends Omit<IPurchaseBook, "price"> {
  borrow_fees_per_week: string;
  deposit_fees: string;
}
