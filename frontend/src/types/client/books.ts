export type BookStatus = 'BORROW' | 'PURCHASE';

export interface Author {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface BookDetails {
  book_details_id: number
  status: BookStatus;
  available_stock: number;
}

export interface Book {
  id: number;
  title: string;
  price: number;
  description: string;
  cover_img: string ;
  author: Author;
  category: Category;
  book_details: BookDetails[];
  publish_year: string; 
}

