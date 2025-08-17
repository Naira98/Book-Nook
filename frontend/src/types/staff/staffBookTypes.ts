export interface IAddBookData {
  title: string;
  price: string;
  description: string;
  publish_year: number;
  author_id: number;
  category_id: number;
  img_file: File;
  purchase_available_stock?: number;
  borrow_available_stock?: number;
}

export interface IUpdateBookData extends Omit<IAddBookData, "img_file"> {
  id: number;
  img_file?: File;
}

export interface IBookDetailsForUpdate
  extends Omit<IUpdateBookData, "img_file"> {
  cover_img: string;
}

export interface ICreateAuthorCategoryData {
  name: string;
}
