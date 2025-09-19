import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import SuperAdminNav from "../NavBar/SuperAdminNav";
import Footer from "../LandingPage/Footer";
import AccountsTable from "./AccountsTable";
import PageContainer from "./PageContainer";

const ManageAccount = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    axios
      .get("http://localhost:5000/manageaccount/accounts")
      .then(res => setAccounts(res.data))
      .catch(err => console.error("Error fetching accounts:", err));
  }, []);

  const handleDelete = (id) =>
    setAccounts(prev => prev.filter(a => a.id !== id));

  const handleUpdateStatus = (id, status) =>
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));

  return (
    <div className="flex min-h-screen flex-col bg-white font-poppins">
      <SuperAdminNav />

      {/* Let the window handle vertical scrolling. */}
      <main className="flex-grow pt-[100px] pb-10 overflow-visible">
        <PageContainer>
          <h2 className="mb-6 text-center text-3xl font-bold text-green-600 md:text-4xl">
            Manage Accounts
          </h2>

          <AccountsTable
            accounts={accounts}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
};

export default ManageAccount;
