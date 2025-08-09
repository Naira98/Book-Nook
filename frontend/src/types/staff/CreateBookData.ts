export interface ICreateBookData {
  title: string;
  price: number;
  description: string;
  publish_year: number;
  author_id: number;
  category_id: number;
  img_file: File;
  purchase_available_stock?: number;
  borrow_available_stock?: number;
}
