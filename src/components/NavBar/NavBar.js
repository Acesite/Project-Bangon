import React from "react";

const NavBar = () => {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/images/AgriGIS.png" alt="Lander Logo" className="h-[50px] w-auto" />
        </div>

        {/* Navigation + Login Container */}
        <div className="flex items-center space-x-6 ml-auto">
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="tracking-wide text-black-600 hover:text-green-800 font-light">Home</a>
            <a href="#" className="tracking-wide text-black-600 hover:text-green-800 font-light">About</a>
            <a href="#" className="tracking-wide text-black-600 hover:text-green-800 font-light">Contacts</a>
          </nav>

          {/* CTA Buttons */}
          <a 
            href="#" 
            className="hidden md:inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 ease-out hover:bg-green-700 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          >
            Register
          </a>

          <a 
            href="/" 
            className="hidden md:inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 ease-out hover:bg-green-700 hover:shadow-lg hover:-translate-y-1 active:scale-95"
          >
            Login
          </a>
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
