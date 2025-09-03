import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useSearchParams } from "react-router-dom";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import { useGetManagerDashboardStats } from "../../hooks/manager/useGetManagerDashboardStats";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

const ManagerDashboardPage = () => {
  const { dashboardStats, isPending, error } = useGetManagerDashboardStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const tabs = ["overview", "financial", "inventory", "users"];

  if (isPending) return <FullScreenSpinner />;

  if (error) {
    return (
      <div className="bg-error/20 text-error rounded-md p-4">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="bg-error/20 text-error rounded-md p-4">
        No data available
      </div>
    );
  }

  const {
    order_stats,
    return_order_stats,
    financial_stats,
    inventory_stats,
    user_stats,
  } = dashboardStats;

  // Order Status Chart Data with vibrant colors
  const orderStatusData = {
    labels: Object.keys(order_stats.orders_by_status),
    datasets: [
      {
        label: "Orders by Status",
        data: Object.values(order_stats.orders_by_status),
        backgroundColor: [
          "rgba(74, 222, 128, 0.8)", // Vibrant green
          "rgba(96, 165, 250, 0.8)", // Vibrant blue
          "rgba(251, 146, 60, 0.8)", // Orange
          "rgba(248, 113, 113, 0.8)", // Red
          "rgba(139, 92, 246, 0.8)", // Purple
          "rgba(16, 185, 129, 0.8)", // Emerald
        ],
        borderColor: [
          "rgb(74, 222, 128)",
          "rgb(96, 165, 250)",
          "rgb(251, 146, 60)",
          "rgb(248, 113, 113)",
          "rgb(139, 92, 246)",
          "rgb(16, 185, 129)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Financial Overview Chart Data with vibrant colors
  const financialData = {
    labels: ["Purchase Revenue", "Borrowing Revenue", "Delivery Revenue"],
    datasets: [
      {
        label: "Revenue (EGP)",
        data: [
          financial_stats.total_purchase_revenue,
          financial_stats.total_borrowing_revenue,
          financial_stats.total_delivery_revenue,
        ],
        backgroundColor: [
          "rgba(74, 222, 128, 0.7)", // Green
          "rgba(96, 165, 250, 0.7)", // Blue
          "rgba(251, 146, 60, 0.7)", // Orange
        ],
        borderColor: [
          "rgb(74, 222, 128)",
          "rgb(96, 165, 250)",
          "rgb(251, 146, 60)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // User Distribution Chart Data with vibrant colors
  const userRoleData = {
    labels: Object.keys(user_stats.users_by_role),
    datasets: [
      {
        label: "Users by Role",
        data: Object.values(user_stats.users_by_role),
        backgroundColor: [
          "rgba(96, 165, 250, 0.7)", // Blue
          "rgba(251, 146, 60, 0.7)", // Orange
          "rgba(139, 92, 246, 0.7)", // Purple
          "rgba(16, 185, 129, 0.7)", // Emerald
        ],
        borderColor: [
          "rgb(96, 165, 250)",
          "rgb(251, 146, 60)",
          "rgb(139, 92, 246)",
          "rgb(16, 185, 129)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Book Status Chart Data with vibrant colors
  const bookStatusData = {
    labels: Object.keys(inventory_stats.books_by_status),
    datasets: [
      {
        label: "Books by Status",
        data: Object.values(inventory_stats.books_by_status),
        backgroundColor: [
          "rgba(96, 165, 250, 0.7)", // Blue
          "rgba(251, 146, 60, 0.7)", // Orange
          "rgba(74, 222, 128, 0.7)", // Green
          "rgba(248, 113, 113, 0.7)", // Red
          "rgba(139, 92, 246, 0.7)", // Purple
        ],
        borderColor: [
          "rgb(96, 165, 250)",
          "rgb(251, 146, 60)",
          "rgb(74, 222, 128)",
          "rgb(248, 113, 113)",
          "rgb(139, 92, 246)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Top Selling Books Chart Data with vibrant colors
  const topSellingBooksData = {
    labels: inventory_stats.top_5_bestselling_books.map((book) => book.title),
    datasets: [
      {
        label: "Copies Sold",
        data: inventory_stats.top_5_bestselling_books.map(
          (book) => book.total_sold_quantity,
        ),
        backgroundColor: "rgba(251, 146, 60, 0.7)",
        borderColor: "rgb(251, 146, 60)",
        borderWidth: 2,
      },
    ],
  };

  // Most Borrowed Books Chart Data with vibrant colors
  const mostBorrowedBooksData = {
    labels: inventory_stats.top_5_most_borrowed_books.map((book) => book.title),
    datasets: [
      {
        label: "Times Borrowed",
        data: inventory_stats.top_5_most_borrowed_books.map(
          (book) => book.total_borrows,
        ),
        backgroundColor: "rgba(96, 165, 250, 0.7)",
        borderColor: "rgb(96, 165, 250)",
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#012e4a", // Primary color
          font: {
            weight: "bold" as const,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#012e4a", // Primary color
          font: {
            weight: "bold" as const,
          },
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-primary mb-6 text-3xl font-bold">
        Manager Dashboard
      </h1>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`cursor-pointer px-1 pb-4 font-semibold capitalize transition-colors duration-200 ${
                activeTab === tab
                  ? "text-secondary border-secondary border-b"
                  : "text-layout/80 hover:text-secondary"
              }`}
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="border-primary rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Total Orders
              </h3>
              <p className="text-primary text-3xl font-bold">
                {order_stats.total_orders.toLocaleString()}
              </p>
            </div>
            <div className="border-secondary rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Total Returns
              </h3>
              <p className="text-secondary text-3xl font-bold">
                {return_order_stats.total_return_orders}
              </p>
            </div>
            <div className="border-success rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">Total Books</h3>
              <p className="text-success text-3xl font-bold">
                {inventory_stats.total_books.toLocaleString()}
              </p>
            </div>
            <div className="border-layout rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">Total Users</h3>
              <p className="text-layout text-3xl font-bold">
                {user_stats.total_users.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                Order Status Distribution
              </h3>
              <div className="h-80">
                <Doughnut
                  data={orderStatusData}
                  options={doughnutChartOptions}
                />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                Financial Overview
              </h3>
              <div className="h-80">
                <Bar data={financialData} options={barChartOptions} />
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                User Distribution
              </h3>
              <div className="h-80">
                <Doughnut data={userRoleData} options={doughnutChartOptions} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                Book Status Distribution
              </h3>
              <div className="h-80">
                <Doughnut
                  data={bookStatusData}
                  options={doughnutChartOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="border-success rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Purchase Revenue
              </h3>
              <p className="text-success text-2xl font-bold">
                {financial_stats.total_purchase_revenue.toLocaleString()} EGP
              </p>
            </div>
            <div className="border-success rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Borrowing Revenue
              </h3>
              <p className="text-success text-2xl font-bold">
                {financial_stats.total_borrowing_revenue.toLocaleString()} EGP
              </p>
            </div>
            <div className="border-success rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Delivery Revenue
              </h3>
              <p className="text-success text-2xl font-bold">
                {financial_stats.total_delivery_revenue.toLocaleString()} EGP
              </p>
            </div>
            <div className="border-error rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Promo Code Discounts
              </h3>
              <p className="text-error text-2xl font-bold">
                - {financial_stats.total_promo_code_discounts.toLocaleString()}{" "}
                EGP
              </p>
            </div>
            <div className="border-primary rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Wallet Deposits
              </h3>
              <p className="text-primary text-2xl font-bold">
                {financial_stats.total_wallet_deposits.toLocaleString()} EGP
              </p>
            </div>
            <div className="border-error rounded-lg border-l-6 bg-white p-6 shadow-md">
              <h3 className="text-layout text-lg font-semibold">
                Wallet Withdrawals
              </h3>
              <p className="text-error text-2xl font-bold">
                - {financial_stats.total_wallet_withdrawals.toLocaleString()}{" "}
                EGP
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-primary mb-4 text-xl font-semibold">
              Revenue Breakdown
            </h3>
            <div className="h-96">
              <Bar data={financialData} options={barChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                Top Selling Books
              </h3>
              <div className="h-96">
                <Bar data={topSellingBooksData} options={barChartOptions} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                Most Borrowed Books
              </h3>
              <div className="h-96">
                <Bar data={mostBorrowedBooksData} options={barChartOptions} />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-primary mb-4 text-xl font-semibold">
              Low Stock Books
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Book Title
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Available Stock
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {inventory_stats.low_stock_books.map((book, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-center text-sm font-medium whitespace-nowrap text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            book.available_stock === 0
                              ? "bg-error/20 text-error"
                              : book.available_stock < 3
                                ? "bg-secondary/20 text-secondary"
                                : "bg-success/20 text-success"
                          }`}
                        >
                          {book.available_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500">
                        {book.available_stock === 0
                          ? "Out of Stock"
                          : book.available_stock < 3
                            ? "Very Low"
                            : "Low"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                User Distribution by Role
              </h3>
              <div className="h-96">
                <Doughnut data={userRoleData} options={doughnutChartOptions} />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-primary mb-4 text-xl font-semibold">
                User Distribution by Status
              </h3>
              <div className="h-96">
                <Doughnut
                  data={{
                    labels: Object.keys(user_stats.users_by_status),
                    datasets: [
                      {
                        label: "Users by Status",
                        data: Object.values(user_stats.users_by_status),
                        backgroundColor: [
                          "rgba(96, 165, 250, 0.7)", // Blue
                          "rgba(251, 146, 60, 0.7)", // Orange
                          "rgba(74, 222, 128, 0.7)", // Green
                          "rgba(248, 113, 113, 0.7)", // Red
                        ],
                        borderColor: [
                          "rgb(96, 165, 250)",
                          "rgb(251, 146, 60)",
                          "rgb(74, 222, 128)",
                          "rgb(248, 113, 113)",
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={doughnutChartOptions}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-primary mb-4 text-xl font-semibold">
              User Statistics
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-primary/10 border-primary rounded-lg border-l-6 p-4 text-center">
                <p className="text-primary text-4xl font-bold">
                  {user_stats.total_users.toLocaleString()}
                </p>
                <p className="text-layout text-lg">Total Users</p>
              </div>
              {Object.entries(user_stats.users_by_role).map(([role, count]) => (
                <div
                  key={role}
                  className="bg-secondary/10 border-secondary rounded-lg border-l-6 p-4 text-center"
                >
                  <p className="text-secondary text-3xl font-bold">
                    {count.toLocaleString()}
                  </p>
                  <p className="text-md text-layout capitalize">
                    {role.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboardPage;
