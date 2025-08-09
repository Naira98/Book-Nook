import type { IBookTable } from "../types/BookTable";
import type { ICreateBookData } from "../types/staff/CreateBookData";
import apiReq from "./apiReq";

export const createBook = async (
  bookData: ICreateBookData,
): Promise<IBookTable> => {
  const formData = new FormData();
  formData.append("title", bookData.title);
  formData.append("price", String(bookData.price));
  formData.append("description", bookData.description);
  formData.append("category_id", String(bookData.category_id));
  formData.append("author_id", String(bookData.author_id));
  formData.append("publish_year", String(bookData.publish_year));

  if (bookData.img_file) {
    formData.append("img_file", bookData.img_file);
  }

  if (
    bookData.purchase_available_stock !== undefined &&
    bookData.purchase_available_stock !== null
  ) {
    formData.append(
      "purchase_available_stock",
      String(bookData.purchase_available_stock),
    );
  }
  if (
    bookData.borrow_available_stock !== undefined &&
    bookData.borrow_available_stock !== null
  ) {
    formData.append(
      "borrow_available_stock",
      String(bookData.borrow_available_stock),
    );
  }

  const response = await apiReq("POST", "/books/create", formData);
  return response as IBookTable;
};
