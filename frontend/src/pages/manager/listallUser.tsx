import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetUsers } from "../../hooks/manager/useGetUsers"; // ✅ import your hook
import type { IUser } from "../../types/User";
import  type {UserRole}from "../../types/User"; // ✅ import UserRole type

const UsersList = () => {
  const { users, isPending } = useGetUsers(); // ✅ fetch users from backend
  const [filter, setFilter] = useState<"all" | "employee" | "courier">("all");

  // ✅ safely handle loading + no users
  if (isPending) {
    return (
      <div className="text-center py-8" style={{ color: "var(--color-primary)" }}>
        Loading users...
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--color-primary)" }}>
        No users found
      </div>
    );
  }

  const filteredUsers = users.filter((user: IUser) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--color-primary)" }}
      >
        Users List
      </h1>

      {/* Filter Buttons */}
      <div className="flex justify-end mb-6">
        <div className="flex space-x-2">
          {["all", "employee", "courier"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role as "all" | "employee" | "courier")}
              className={`px-4 py-2 rounded-md ${
                filter === role ? "text-white" : "bg-gray-200 text-gray-700"
              }`}
              style={{
                backgroundColor: filter === role ? "var(--color-primary)" : "",
              }}
            >
              {role === "all"
                ? "All"
                : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Email",
                  "Phone",
                  "Role",
                  "Status",
                  "Date Joined",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: IUser) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--color-primary)" }}>
                    {user.id}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--color-primary)" }}>
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--color-primary)" }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--color-primary)" }}>
                    {user.phone_number}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                         user.role === "EMPLOYEE" ? "text-green-800" : "text-purple-800"
                      }`}
                      style={{
                        backgroundColor:
                          user.role === "EMPLOYEE"
                            ? "var(--color-secondary)"
                            : "#E9D8FD",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "ACTIVATED" ? "text-green-800" : "text-red-800"
                      }`}
                      style={{
                        backgroundColor:
                          user.status === "ACTIVATED" ? "#D1FAE5" : "#FECACA",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 text-sm" style={{ color: "var(--color-primary)" }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td> */}
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      to={`/users/${user.id}`}
                      className="px-3 py-1 rounded-md text-xs text-white hover:bg-blue-700"
                      style={{ backgroundColor: "var(--color-primary)" }}
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-8" style={{ color: "var(--color-primary)" }}>
          No users found
        </div>
      )}
    </div>
  );
};

export default UsersList;
