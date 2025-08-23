import { useMemo, useState } from "react";
import { useGetUsers } from "../../hooks/manager/useGetUsers";
import { UserRole } from "../../types/User";
import { Link } from "react-router-dom";

const UsersPage = () => {
  const { users = [], isPending } = useGetUsers();

  const [filter, setFilter] = useState<"ALL" | UserRole>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; 
  const filteredUsers = useMemo(() => {
    if (filter === "ALL") return users;
    return users.filter((user) => user.role === filter);
  }, [users, filter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  if (isPending) return <p style={{ color: "var(--color-primary)" }}>Loading users...</p>;

  return (
    
    <div className="p-6" style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>Manager</h1>
<div className="flex justify-between items-center mb-6">
  {/* Left: Add New User button */}
  <Link
    to="/manager/add-new-user" 
    className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
    style={{ backgroundColor: "var(--color-primary)" }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-hover)")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
  >
    + Add New User
  </Link>

  {/* Right: Filter buttons */}
  <div className="flex gap-3">
    <button
      onClick={() => {
        setFilter("ALL");
        setCurrentPage(1);
      }}
      className={`px-4 py-2 rounded-lg transition-colors ${
        filter === "ALL" ? "text-white" : "text-gray-700"
      }`}
      style={{
        backgroundColor:
          filter === "ALL" ? "var(--color-primary)" : "#e2e8f0",
        border: filter !== "ALL" ? "1px solid #cbd5e0" : "none",
      }}
    >
      All
    </button>

    <button
      onClick={() => {
        setFilter(UserRole.CLIENT);
        setCurrentPage(1);
      }}
      className={`px-4 py-2 rounded-lg transition-colors ${
        filter === "CLIENT" ? "text-white" : "text-gray-700"
      }`}
      style={{
        backgroundColor:
          filter === "CLIENT" ? "var(--color-primary)" : "#e2e8f0",
        border: filter !== "CLIENT" ? "1px solid #cbd5e0" : "none",
      }}
    >
      Clients
    </button>

    <button
      onClick={() => {
        setFilter(UserRole.EMPLOYEE);
        setCurrentPage(1);
      }}
      className={`px-4 py-2 rounded-lg transition-colors ${
        filter === "EMPLOYEE" ? "text-white" : "text-gray-700"
      }`}
      style={{
        backgroundColor:
          filter === "EMPLOYEE" ? "var(--color-primary)" : "#e2e8f0",
        border: filter !== "EMPLOYEE" ? "1px solid #cbd5e0" : "none",
      }}
    >
      Employees
    </button>

    <button
      onClick={() => {
        setFilter(UserRole.COURIER);
        setCurrentPage(1);
      }}
      className={`px-4 py-2 rounded-lg transition-colors ${
        filter === "COURIER" ? "text-white" : "text-gray-700"
      }`}
      style={{
        backgroundColor:
          filter === "COURIER" ? "var(--color-primary)" : "#e2e8f0",
        border: filter !== "COURIER" ? "1px solid #cbd5e0" : "none",
      }}
    >
      Couriers
    </button>
  </div>
</div>


      {/* Users table */}
      <div className="border rounded-lg overflow-hidden shadow" style={{ backgroundColor: "white" }}>
        <table className="min-w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Role</th>

            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3" style={{ color: "var(--color-primary)" }}>{user.first_name}</td>
                <td className="px-4 py-3" style={{ color: "var(--color-primary)" }}>{user.email}</td>
                <td className="px-4 py-3" style={{ color: "var(--color-primary)" }}>{user.wallet}</td>
                <td className="px-px-2 py-1 rounded-full text-xs py-3" style={{ color: "var(--color-primary)" }}>{user.status}</td>

                <td className="px-4 py-3 font-semibold">
                  <span className="px-2 py-1 rounded-full text-xs" style={{
                    backgroundColor: user.role === "CLIENT" 
                      ? "rgba(11, 52, 96, 0.1)" 
                      : user.role === "EMPLOYEE" 
                      ? "rgba(242, 182, 61, 0.2)" 
                      : "rgba(11, 52, 96, 0.15)",
                    color: user.role === "CLIENT" 
                      ? "var(--color-primary)" 
                      : user.role === "EMPLOYEE" 
                      ? "#b45309" 
                      : "var(--color-primary)"
                  }}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center" style={{ color: "var(--color-primary)" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center items-center mt-6 gap-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded transition-colors"
          style={{ 
            backgroundColor: currentPage === 1 ? "#e2e8f0" : "var(--color-primary)",
            color: currentPage === 1 ? "#64748b" : "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer"
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = "var(--color-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = "var(--color-primary)";
            }
          }}
        >
          Prev
        </button>
        <span style={{ color: "var(--color-primary)" }}>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 rounded transition-colors"
          style={{ 
            backgroundColor: currentPage === totalPages || totalPages === 0 ? "#e2e8f0" : "var(--color-primary)",
            color: currentPage === totalPages || totalPages === 0 ? "#64748b" : "white",
            cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer"
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages && totalPages !== 0) {
              e.currentTarget.style.backgroundColor = "var(--color-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages && totalPages !== 0) {
              e.currentTarget.style.backgroundColor = "var(--color-primary)";
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersPage;




