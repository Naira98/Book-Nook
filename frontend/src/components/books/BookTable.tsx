import type { IBookTable } from "../../types/BookTable";

const BookTable = ({ books }: { books: IBookTable[] }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="w-1/4 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Title
            </th>
            <th className="w-1/6 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Author
            </th>
            <th className="w-1/6 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Category
            </th>
            <th className="w-1/8 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Price
            </th>
            <th className="w-1/8 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Purchase
            </th>
            <th className="w-1/8 px-4 py-3 text-center text-xs font-medium tracking-wider text-white uppercase">
              Borrow
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {books.map((book) => (
            <tr
              key={book.id}
              className="transition-colors duration-150 hover:bg-gray-50"
            >
              <td
                className="truncate px-4 py-4 text-center text-sm text-gray-900"
                title={book.title}
              >
                {book.title}
              </td>
              <td
                className="truncate px-4 py-4 text-center text-sm text-gray-500"
                title={book.author_name}
              >
                {book.author_name}
              </td>
              <td
                className="truncate px-4 py-4 text-center text-sm text-gray-500"
                title={book.category_name}
              >
                {book.category_name}
              </td>
              <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                ${book.price}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-500">
                {book.available_stock_purchase}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-500">
                {book.available_stock_borrow}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTable;
