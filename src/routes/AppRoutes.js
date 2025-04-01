import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import SignUp from "../components/Signup/SignUp";
import LandingPage from "../components/LandingPage/LandingPage";
import AboutUs from "../components/LandingPage/AboutUs";
import Contact  from "../components/LandingPage/Contact";
import SuperAdminLandingPage  from "../components/SuperAdmin/SuperAdminLanding";
import ManageAccount from "../components/SuperAdmin/ManageAccount";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/Contact" element={<Contact />} />

      <Route path="/SuperAdminLandingPage" element={<SuperAdminLandingPage />} />
      <Route path="/ManageAccount" element={<ManageAccount />} />
    </Routes>
  );
};

export default AppRoutes;
