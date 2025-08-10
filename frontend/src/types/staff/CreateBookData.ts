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
  title?: string;
  price?: number;
  description?: string;
  publish_year?: number;
  category_id?: number;
  author_id?: number;
  cover_img?: string;
  purchase_available_stock?: number;
  borrow_available_stock?: number;
}

// Define the type for an image update, which contains a FormData object
export type UpdateBookImageInput = {
  id: number;
  formData: FormData;
};

// Define the type for a regular book details update
export type UpdateBookDetailsInput = {
  id: number;
} & Partial<Omit<IBookDetailsForUpdate, 'cover_img'>>;

// Combine both into a single union type
export type UpdateBookInput = UpdateBookImageInput | UpdateBookDetailsInput;
