import React from "react";
import NavBar from "../NavBar/NavBar"; // Import NavBar component

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-white font-poppins">
      {/* Include NavBar Component */}
      <NavBar />

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[80vh] flex items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/images/Hero.jpeg')" }} // Change this path
      >
        {/* Overlay (optional for better text visibility) */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 relative">
          {/* Left Side Content */}
          <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.2] mb-6">
              Agriculture Geographical Information System
            </h1>
            <p className="mt-4">Lorem ipsum</p>
            <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Explore
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
