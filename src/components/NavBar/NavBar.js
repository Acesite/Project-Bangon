import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50 font-poppins">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/images/AgriGIS.png" alt="Lander Logo" className="h-[50px] w-auto" />
        </div>

        {/* Navigation + Login Container */}
        <div className="flex items-center space-x-6 ml-auto">
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
      <a
        href="/"
        className={`tracking-wide font-light hover:text-green-700 ${
          location.pathname === "/" ? "text-green-700 font-medium" : "text-black-600"
        }`}
      >
        Home
      </a>
      <a
        href="/AboutUs"
        className={`tracking-wide font-light hover:text-green-700 ${
          location.pathname === "/AboutUs" ? "text-green-700 font-medium" : "text-black-600"
        }`}
      >
        About
      </a>
      <a
        href="/Contact"
        className={`tracking-wide font-light hover:text-green-700 ${
          location.pathname === "/Contact" ? "text-green-700 font-medium" : "text-black-600"
        }`}
      >
        Contacts
      </a>
    </nav>

          {/* CTA Buttons */}
          <Link to="/Signup">
  <button class="relative inline-block group">
    <span class="relative z-10 px-3.5 py-2 overflow-hidden font-medium leading-tight flex items-centrer justify-center text-green-600 transition-colors duration-300 ease-out border-2 border-green-600 rounded-lg group-hover:text-white">
      <span class="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
      <span class="absolute left-0 w-40 h-40 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-green-600 group-hover:-rotate-180 ease"></span>
      <span class="relative text-base font-poppins">Register</span>
    </span>
    <span class="absolute bottom-0 right-0 w-full h-9 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-600 rounded-lg group-hover:mb-0 group-hover:mr-0 group-hover:mb-2" data-rounded="rounded-lg"></span>
  </button>
</Link>

<Link to="/Login">
<button class="relative inline-block group">
<span
class="relative z-10 px-3.5 py-2 overflow-hidden font-medium leading-tight flex items-centrer justify-center text-green-600 transition-colors duration-300 ease-out border-2 border-green-600 rounded-lg group-hover:text-white">
<span class="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
<span
  class="absolute left-0 w-40 h-40 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-green-600 group-hover:-rotate-180 ease"></span>
<span class="relative text-base font-poppins">Login</span>
</span>
<span
class="absolute bottom-0 right-0 w-full h-9 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-600 rounded-lg group-hover:mb-0 group-hover:mr-0 group-hover:mb-2"
data-rounded="rounded-lg"></span>
</button>
</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600 focus:outline-none">
          {/* Add a menu icon here */}
        </button>
      </div>
    </header>
  );
};

export default NavBar;
