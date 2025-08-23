
import type { IBookTable } from "../types/BookTable";
import type {
  IAddBookData,
  IUpdateBookData,
} from "../types/staff/staffBookTypes";
import apiReq from "./apiReq";

export const addBook = async (bookData: IAddBookData): Promise<IBookTable> => {
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

  formData.append(
    "purchase_available_stock",
    String(bookData.purchase_available_stock),
  );
  formData.append(
    "borrow_available_stock",
    String(bookData.borrow_available_stock),
  );

  const response = await apiReq("POST", "/books", formData);
  return response as IBookTable;
};

export const updateBook = async (bookData: IUpdateBookData) => {
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

  formData.append(
    "purchase_available_stock",
    String(bookData.purchase_available_stock),
  );
  formData.append(
    "borrow_available_stock",
    String(bookData.borrow_available_stock),
  );

  const response = await apiReq("PATCH", `/books/${bookData.id}`, formData);
  return response as IBookTable;
};
