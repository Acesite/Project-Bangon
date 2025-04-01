import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";
import AccountsTable from "../SuperAdmin/AccountsTable";

const ManageAccount = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    fetchAccounts();
  }, []);

  const fetchAccounts = () => {
    axios.get("http://localhost:5000/manageaccount/accounts")
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
      });
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, status: newStatus } : account
    ));
  };
  

  return (
    <div className="flex flex-col h-screen bg-white-100 font-poppins">
      <SuperAdminNav />
      <div className="flex-grow container mx-auto p-6 mt-20 bg-white mb-7">
        <h2 className="text-3xl font-bold text-green-600 mb-6 text-center">Manage Accounts</h2>
        <AccountsTable accounts={accounts} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} />
      </div>
      <Footer />
    </div>
  );
};

export default ManageAccount;
