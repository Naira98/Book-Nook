import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  const orders = [
    {
      order: {
        id: 1,
        address: "123 University St, Cairo",
        phone_num: "01234567890",
        created_at: "2023-05-15T10:30:00",
        status: "pending",
        user_id: {
          first_name: "Ahmed",
          last_name: "Mohamed",
          email: "ahmed@example.com"
        },
        items: [
          { name: "Product 1", quantity: 2, price: 100 },
          { name: "Product 2", quantity: 1, price: 200 }
        ],
        total: 400
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
          last_name: "Ali",
          email: "sarah@example.com"
        },
        items: [
          { name: "Product 3", quantity: 3, price: 150 }
        ],
        total: 450
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
          last_name: "Khaled",
          email: "mohamed@example.com"
        },
        items: [
          { name: "Product 4", quantity: 1, price: 300 },
          { name: "Product 5", quantity: 2, price: 250 }
        ],
        total: 800
      },
      order_type: "return_order"
    },
  ];

  const order = orders.find(o => o.order.id.toString() === id);
  
  const [currentStatus, setCurrentStatus] = useState(order.order.status || 'created');
  
  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  const handleStatusChange = () => {
    const statusOrder = ['created', 'on the way', 'picked up', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    setCurrentStatus(statusOrder[nextIndex]);
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 rounded-md text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Back to Orders
      </button>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 mb-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Order #{order.order.id} Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Customer Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.order.user_id.first_name} {order.order.user_id.last_name}</p>
              <p><span className="font-medium">Email:</span> {order.order.user_id.email}</p>
              <p><span className="font-medium">Phone:</span> {order.order.phone_num}</p>
              <p><span className="font-medium">Address:</span> {order.order.address}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Order Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Order Date:</span> {new Date(order.order.created_at).toLocaleString()}</p>
              <p>
                <span className="font-medium">Type:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${order.order_type === 'order' ? 'text-green-800' : 'text-purple-800'}`}
                      style={{ backgroundColor: order.order_type === 'order' ? 'var(--color-secondary)' : '#E9D8FD' }}>
                  {order.order_type === 'order' ? 'Order' : 'Return'}
                </span>
              </p>
              <p>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  currentStatus === 'created' ? 'text-blue-800 bg-blue-100' :
                  currentStatus === 'on the way' ? 'text-yellow-800 bg-yellow-100' :
                  currentStatus === 'picked up' ? 'text-orange-800 bg-orange-100' :
                  'text-green-800 bg-green-100'
                }`}>
                  {currentStatus}
                </span>
              </p>
              <p><span className="font-medium">Total:</span> ${order.order.total}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button 
          className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Report Problem
        </button>
        <button 
          onClick={handleStatusChange}
          className="px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {currentStatus === 'created' ? 'Mark as On The Way' : 
           currentStatus === 'on the way' ? 'Mark as Picked Up' : 
           currentStatus === 'picked up' ? 'Mark as Delivered' : 
           'Order Completed'}
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;