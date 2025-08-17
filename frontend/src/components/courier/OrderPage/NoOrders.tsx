export default function NoOrders({ activeTab }: { activeTab: string }) {
  return (
    <div className="rounded-lg bg-white py-10 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <span className="text-4xl">📭</span>
        <h3 className="mt-3 text-base font-medium text-gray-700">
          No orders found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {activeTab === "my"
            ? "You don't have any assigned orders"
            : activeTab === "orders"
              ? "No delivery orders available"
              : "No return orders available"}
        </p>
      </div>
    </div>
  );
}
