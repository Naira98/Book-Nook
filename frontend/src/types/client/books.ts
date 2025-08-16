export type BookStatus = "BORROW" | "PURCHASE";

export interface Author {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface BookDetails {
  id: number;
  status: BookStatus;
  available_stock: number;
}

export interface Book {
  id: number;
  title: string;
  price: string;
  description: string;
  cover_img: string | null;
  author: Author;
  category: Category;
  book_details: BookDetails[];
}
