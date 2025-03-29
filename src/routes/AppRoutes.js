import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import SignUp from "../components/Signup/SignUp";
import LandingPage from "../components/LandingPage/LandingPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/LandingPage" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
