import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OrdersList = () => {
  const [orders, setOrders] = useState([
    {
      order: {
        id: 1,
        address: "123 University St, Cairo",
        phone_num: "01234567890",
        created_at: "2023-05-15T10:30:00",
        status: "pending",
        user_id: {
          first_name: "Ahmed",
          last_name: "Mohamed"
        }
      },
      order_type: "order"
    },
    {
      order: {
        id: 2,
        address: "456 Victory St, Giza",
        phone_num: "01112223334",
        created_at: "2023-05-16T14:45:00",
        status: "shipped",
        user_id: {
          first_name: "Sarah",
          last_name: "Ali"
        }
      },
      order_type: "order"
    },
    {
      order: {
        id: 3,
        address: "789 Freedom St, Alexandria",
        phone_num: "01098765432",
        created_at: "2023-05-17T09:15:00",
        status: "delivered",
        user_id: {
          first_name: "Mohamed",
          last_name: "Khaled"
        }
      },
      order_type: "return_order"
    },
  ]);

  const [filter, setFilter] = useState("all");

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.order_type === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>Delivery Orders</h1>
      
      <div className="flex justify-end mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? 'text-white' : 'bg-gray-200 text-gray-700'}`}
            style={{ backgroundColor: filter === "all" ? 'var(--color-primary)' : '' }}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("order")}
            className={`px-4 py-2 rounded-md ${filter === "order" ? 'text-white' : 'bg-gray-200 text-gray-700'}`}
            style={{ backgroundColor: filter === "order" ? 'var(--color-primary)' : '' }}
          >
            Orders
          </button>
          <button 
            onClick={() => setFilter("return_order")}
            className={`px-4 py-2 rounded-md ${filter === "return_order" ? 'text-white' : 'bg-gray-200 text-gray-700'}`}
            style={{ backgroundColor: filter === "return_order" ? 'var(--color-primary)' : '' }}
          >
            Returns
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((item) => (
                <tr key={item.order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>{item.order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>
                    {item.order.user_id.first_name} {item.order.user_id.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>{item.order.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>{item.order.phone_num}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>
                    {new Date(item.order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>
                    <span className={`px-2 py-1 rounded-full text-xs ${item.order_type === 'order' ? 'text-green-800' : 'text-purple-800'}`}
                          style={{ backgroundColor: item.order_type === 'order' ? 'var(--color-secondary)' : '#E9D8FD' }}>
                      {item.order_type === 'order' ? 'Order' : 'Return'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-primary)' }}>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.order.status === 'pending' ? 'text-yellow-800' :
                      item.order.status === 'shipped' ? 'text-blue-800' :
                      'text-green-800'
                    }`}
                    style={{
                      backgroundColor: 
                        item.order.status === 'pending' ? '#FEF3C7' :
                        item.order.status === 'shipped' ? '#DBEAFE' :
                        '#D1FAE5'
                    }}>
                      {item.order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/orders/${item.order.id}`}
                      className="px-3 py-1 rounded-md text-xs text-white hover:bg-blue-700"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--color-primary)' }}>
          No orders available
        </div>
      )}
    </div>
  );
};

export default OrdersList;