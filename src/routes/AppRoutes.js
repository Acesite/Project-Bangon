import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import SignUp from "../components/Signup/SignUp";
import LandingPage from "../components/LandingPage/LandingPage";
import AboutUs from "../components/LandingPage/AboutUs";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/AboutUs" element={<AboutUs />} />
    </Routes>
  );
};

export default AppRoutes;
