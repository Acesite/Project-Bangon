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
import FarmerSignup from "../components/Signup/SignupFarmer";
import ChooseMap from "../components/ChooseRole/ChooseMap";
import ChooseRoleLogin from "../components/ChooseRole/ChooseRoleLogin";
import LoginFarmer from "../components/Login/LoginFarmer";
import ManageCalamity from "../components/User/ManageCalamity";


const AppRoutes = () => {
  return (
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/FarmerSignup" element={<FarmerSignup />} />
      <Route path="/ChooseMap" element={<ChooseMap />} />
      <Route path="/ChooseRoleLogin" element={<ChooseRoleLogin />} />
      <Route path="/LoginFarmer" element={<LoginFarmer />} />

      {/*Super Admin*/}
      <Route path="/SuperAdminLandingPage" element={<SuperAdminLandingPage />} />
      <Route path="/ManageAccount" element={<ManageAccount />} />
      <Route path="/SuperAdminManageCrop" element={<SuperAdminManageCrop />} />
      <Route path="/SuperAdminMap" element={<SuperAdminMap />} />
      <Route path="/Graphs" element={<Graphs/>} />

      {/*User*/}
      <Route path="/UserMap" element={<UserMap />} />
      <Route path="/CalamityFarmerMap" element={<CalamityMap />} />
   
      {/*Admin*/}
      <Route path="/AdminLanding" element={<AdminLanding />} />
      <Route path="/AdminMap" element={<AdminMap />} />
      <Route path="/AdminLanding" element={<AdminLanding />} />
      <Route path="/ManageCrops" element={<ManageCrop />} />
      <Route path="/ManageCalamity" element={<ManageCalamity />} />
    </Routes>
  );
};

export default AppRoutes; 