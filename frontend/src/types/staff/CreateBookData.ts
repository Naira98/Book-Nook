export interface ICreateBookData {
  title: string;
  price: number;
  description: string;
  publish_year: number;
  author_id: number;
  category_id: number;
  img_file?: File;
  purchase_available_stock?: number;
  borrow_available_stock?: number;
}

export interface IBookDetailsForUpdate {
  id: number;
  title: string;
  price: number;
  description?: string;
  cover_img?: string;
  publish_year: number;
  category_id: number;
  author_id: number;
  purchase_available_stock: number;
  borrow_available_stock: number;
}
