import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ArrowLeft, Search, User, ShoppingCart, Menu, Trash2 } from 'lucide-react';

// Dummy data for demonstration
const cartPurchases = [
  { 
    id: 1, 
    title: 'Emily and the Backbone', 
    author: 'Cloe Mamora',
    isbn: '51251123151',
    price: 21.40, 
    quantity: 1,
    cover_img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=100&fit=crop&crop=center'
  },
  { 
    id: 2, 
    title: 'So You Want To Talk About Race', 
    author: 'Ijeoma Oluo',
    isbn: '2412412125',
    price: 15.63, 
    quantity: 4,
    cover_img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=100&fit=crop&crop=center'
  },
];

const cartBorrows = [
  { 
    id: 3, 
    title: 'The Great Gatsby', 
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    weeks: 3,
    price: 5.99, // Weekly rental price
    deposit: 25.00, // Deposit amount
    cover_img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop&crop=center'
  },
  { 
    id: 4, 
    title: 'To Kill a Mockingbird', 
    author: 'Harper Lee',
    isbn: '9780446310789',
    weeks: 2,
    price: 4.99, // Weekly rental price
    deposit: 20.00, // Deposit amount
    cover_img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop&crop=center'
  },
];

const CheckoutPage = () => {
  // State for purchase quantities
  const [purchases, setPurchases] = useState<{ [key: number]: number }>(
    Object.fromEntries(cartPurchases.map(item => [item.id, item.quantity]))
  );
  // State for borrow durations
  const [borrows, setBorrows] = useState<{ [key: number]: number }>(
    Object.fromEntries(cartBorrows.map(item => [item.id, item.weeks]))
  );
  // State for promocode
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  // State for shipping
  const [shippingOption, setShippingOption] = useState('');

  // Calculate total purchase amount
  const purchaseTotal = cartPurchases.reduce(
    (total, item) => total + item.price * (purchases[item.id] || 0),
    0
  );

  // Calculate total borrow amount
  const borrowTotal = cartBorrows.reduce(
    (total, item) => total + (item.price * (borrows[item.id] || 0)),
    0
  );

  // Calculate total deposits
  const totalDeposits = cartBorrows.reduce(
    (total, item) => total + item.deposit,
    0
  );

  // Calculate shipping cost
  const shippingCost = shippingOption === 'shipping' ? 8.99 : 
                      shippingOption === 'from-site' ? 0 : 0;

  // Calculate tax (assuming 2.8% tax rate)
  // const tax = (purchaseTotal + borrowTotal) * 0.028;

  // Apply promocode discount
  const subtotal = purchaseTotal + borrowTotal;
  const totalAfterPromo = (subtotal  + shippingCost) - promoDiscount;

  // Handlers
  const handlePurchaseChange = (bookId: number, quantity: number) => {
    setPurchases(prev => ({
      ...prev,
      [bookId]: Math.max(0, quantity),
    }));
  };

  const handleBorrowWeeksChange = (bookId: number, weeks: number) => {
    setBorrows(prev => ({
      ...prev,
      [bookId]: Math.min(4, Math.max(1, weeks)),
    }));
  };

  const removePurchaseItem = (bookId: number) => {
    setPurchases(prev => {
      const newPurchases = { ...prev };
      delete newPurchases[bookId];
      return newPurchases;
    });
  };

  const removeBorrowItem = (bookId: number) => {
    setBorrows(prev => {
      const newBorrows = { ...prev };
      delete newBorrows[bookId];
      return newBorrows;
    });
  };

  const deleteAllItems = () => {
    setPurchases({});
    setBorrows({});
    setPromoCode('');
    setPromoDiscount(0);
    setShippingOption('');
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'welcome10') {
      setPromoDiscount(subtotal * 0.1); // 10% discount
    } else if (promoCode.toLowerCase() === 'freeship') {
      setPromoDiscount(shippingCost);
    } else {
      setPromoDiscount(0);
      alert('Invalid promocode');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold text-primary">BookieJar</span>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors">
                  <Menu className="w-5 h-5" />
                  <span>Menu</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find books here.."
                  className="w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                <User className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-primary transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartPurchases.length + cartBorrows.length}
                </span>
              </button>
              <div className="text-sm text-gray-700">
                <span>Roberto Karlos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Books Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="bg-primary text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Purchase Books</h2>
              </div>
              
              {cartPurchases.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Item</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Quantity</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Price</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Total Price</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartPurchases.map(item => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={item.cover_img} 
                                  alt={item.title}
                                  className="w-16 h-20 object-cover rounded-md shadow-sm"
                                />
                                <div>
                                  <p className="text-sm text-gray-500">ISBN {item.isbn}</p>
                                  <p className="font-medium text-gray-900">{item.title}</p>
                                  <p className="text-sm text-gray-600">{item.author}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handlePurchaseChange(item.id, (purchases[item.id] || 0) - 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  disabled={(purchases[item.id] || 0) <= 0}
                                >
                                  <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-medium">
                                  {purchases[item.id] || 0}
                                </span>
                                <button
                                  onClick={() => handlePurchaseChange(item.id, (purchases[item.id] || 0) + 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-gray-900">
                              ${((item.price * (purchases[item.id] || 0)).toFixed(2))}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <button
                                onClick={() => removePurchaseItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No purchase items in cart</p>
                </div>
              )}
            </div>

            {/* Borrow Books Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="bg-primary text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Borrow Books</h2>
              </div>
              
              {cartBorrows.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Item</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Weeks</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Price/Week</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Deposit</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Total</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartBorrows.map(item => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={item.cover_img} 
                                  alt={item.title}
                                  className="w-16 h-20 object-cover rounded-md shadow-sm"
                                />
                                <div>
                                  <p className="text-sm text-gray-500">ISBN {item.isbn}</p>
                                  <p className="font-medium text-gray-900">{item.title}</p>
                                  <p className="text-sm text-gray-600">{item.author}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleBorrowWeeksChange(item.id, (borrows[item.id] || 0) - 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  disabled={(borrows[item.id] || 0) <= 1}
                                >
                                  <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-medium">
                                  {borrows[item.id] || 0}
                                </span>
                                <button
                                  onClick={() => handleBorrowWeeksChange(item.id, (borrows[item.id] || 0) + 1)}
                                  className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  disabled={(borrows[item.id] || 0) >= 4}
                                >
                                  <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-gray-900">
                              ${item.deposit.toFixed(2)}
                            </td>
                            <td className="py-4 px-2 text-center font-medium text-gray-900">
                              ${((item.price * (borrows[item.id] || 0)) + item.deposit).toFixed(2)}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <button
                                onClick={() => removeBorrowItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No borrow items in cart</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Shopping Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Shopping Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div> */}
                
                {/* Shipping Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Shipping Option:</label>
                  <select
                    value={shippingOption}
                    onChange={(e) => setShippingOption(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select shipping option</option>
                    <option value="shipping">Shipping ($8.99)</option>
                    <option value="from-site">Pick up from site (Free)</option>
                  </select>
                </div>
                
                {shippingOption && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                )}
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount:</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total:</span>
                    <span>${totalAfterPromo.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promocode Section */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Have a coupon code?</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code here"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-primary hover:bg-hover text-white rounded-md transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="w-full bg-primary hover:bg-hover text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200 mb-4">
                CHECKOUT
              </button>
              
              <Link 
                to="/purchase-books" 
                className="block text-center text-primary hover:text-hover transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;