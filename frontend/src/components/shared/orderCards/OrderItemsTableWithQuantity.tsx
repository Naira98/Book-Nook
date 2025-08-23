import type { Order, ReturnOrder } from "../../../types/Orders";

const OrderItemsTableWithQuantity = ({
  order,
}: {
  order: Order | ReturnOrder;
}) => {
  const isReturnOrder = !("purchase_order_books_details" in order);

  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
      <h3
        className="mb-4 text-lg font-semibold"
        style={{ color: "var(--color-primary)" }}
      >
        Order Items
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Item
              </th>
              <th className="text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isReturnOrder ? (
              <>
                {(order as ReturnOrder).borrow_order_books_details.map(
                  (item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.book_details.book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">1</td>
                    </tr>
                  ),
                )}
              </>
            ) : (
              <>
                {(order as Order).borrow_order_books_details.map(
                  (item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.book_details.book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">1</td>
                    </tr>
                  ),
                )}
                {(order as Order).purchase_order_books_details.map(
                  (item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.book_details.book.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                    </tr>
                  ),
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderItemsTableWithQuantity;
