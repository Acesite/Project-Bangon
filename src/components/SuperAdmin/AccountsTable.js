import React, { useState } from "react";
import { FaEllipsisH, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import axios from "axios";

const AccountsTable = ({ accounts, onDelete, onUpdateStatus }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownToggle = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await axios.delete(`http://localhost:5000/manageaccount/accounts/${id}`);
      onDelete(id); // Remove the account from UI
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/manageaccount/accounts/${id}/status`, { status: newStatus });
      onUpdateStatus(id, newStatus); // Update the account status in UI
    } catch (error) {
      console.error(`Error updating account status to ${newStatus}:`, error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Declined":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto mt-10">
      <table className="w-full border-collapse bg-white rounded-lg shadow-md border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-center">
            <th className="p-3 border border-gray-300">First Name</th>
            <th className="p-3 border border-gray-300">Last Name</th>
            <th className="p-3 border border-gray-300">Email</th>
            <th className="p-3 border border-gray-300">Status</th>
            <th className="p-3 border border-gray-300">Role</th>
            <th className="p-3 border border-gray-300 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border border-gray-300 hover:bg-gray-50 text-center">
              <td className="p-3 border border-gray-300">{account.first_name}</td>
              <td className="p-3 border border-gray-300">{account.last_name}</td>
              <td className="p-3 border border-gray-300">{account.email}</td>
              <td className="p-3 border border-gray-300">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(account.status)}`}>
                  ● {account.status}
                </span>
              </td>
              <td className="p-3 border border-gray-300">{account.role}</td>
              <td className="p-3 border border-gray-300 text-center">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleDropdownToggle(account.id)}
                  title="Actions"
                >
                  <FaEllipsisH size={16} />
                </button>
                {activeDropdown === account.id && (
                  <div className="absolute bg-white border border-gray-300 shadow-md mt-2 right-21 z-10">
                    <button
                      className="block px-4 py-2 text-sm text-green-600 hover:bg-green-100 w-full text-left"
                      onClick={() => {
                        handleStatusUpdate(account.id, "Approved");
                        setActiveDropdown(null);
                      }}
                    >
                      <FaCheck size={14} className="inline mr-2" />
                      Approve
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 w-full text-left"
                      onClick={() => {
                        handleStatusUpdate(account.id, "Declined");
                        setActiveDropdown(null);
                      }}
                    >
                      <FaTimes size={14} className="inline mr-2" />
                      Decline
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 w-full text-left"
                      onClick={() => {
                        handleDelete(account.id);
                        setActiveDropdown(null);
                      }}
                    >
                      <FaTrash size={14} className="inline mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsTable;
