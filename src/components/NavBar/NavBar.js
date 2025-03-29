import React from "react";

const NavBar = () => {
  return (
    <header className="w-full bg-white shadow-md">
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

      {/* CTA Button */}
      <a href="#" className="hidden md:block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
        Login
      </a>
    </div>

    {/* Mobile Menu Button */}
    <button className="md:hidden text-gray-600 focus:outline-none">
      {/* You can add a mobile menu icon here */}
    </button>
  </div>
</header>



  );
};

export default NavBar;
