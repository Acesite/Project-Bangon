import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import SignUp from "../components/Signup/SignUp";
import LandingPage from "../components/LandingPage/LandingPage";
import AboutUs from "../components/LandingPage/AboutUs";
import Contact from "../components/LandingPage/Contact";
import SuperAdminLandingPage from "../components/SuperAdmin/SuperAdminLanding";
import ManageAccount from "../components/SuperAdmin/ManageAccount";
import UserMap from "../components/User/UserMap";
import AdminLanding from "../components/Admin/AdminLanding";
import AdminMap from "../components/Admin/AdminMapBox";
import ManageCrop from "../components/Admin/ManageCrop";
import SuperAdminManageCrop from "../components/SuperAdmin/SuperManageCrop";
import SuperAdminMap from "../components/SuperAdmin/SuperAdminMap";
import Graphs from "../components/SuperAdmin/Graphs";
import CalamityMap from "../components/User/CalamityMap";



const AppRoutes = () => {
  return (
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/Contact" element={<Contact />} />
     
      {/*Super Admin*/}
      <Route path="/SuperAdminLandingPage" element={<SuperAdminLandingPage />} />
      <Route path="/ManageAccount" element={<ManageAccount />} />
      <Route path="/SuperAdminManageCrop" element={<SuperAdminManageCrop />} />
      <Route path="/SuperAdminMap" element={<SuperAdminMap />} />
      <Route path="/Graphs" element={<Graphs/>} />

      
      {/*User*/}
      <Route path="/UserMap" element={<UserMap />} />
      <Route path="/Calamity" element={<CalamityMap />} />

      {/*Admin*/}
      <Route path="/AdminLanding" element={<AdminLanding />} />
      <Route path="/AdminMap" element={<AdminMap />} />
      <Route path="/AdminLanding" element={<AdminLanding />} />
      <Route path="/ManageCrops" element={<ManageCrop />} />
    </Routes>
  );
};

export default AppRoutes;