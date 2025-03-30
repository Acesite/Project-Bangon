import React from "react";
import { FaFacebook, FaTwitter, FaDiscord } from "react-icons/fa";
const Footer = () => {
    return (
      <footer className="bg-gray-200 text-green-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center">
            {/* Left Section */}
            <div className="mb-4 md:mb-0">
  <img 
    src="/images/AgriGIS.png" // Adjust the path based on your project structure
    alt="AgriGIS Solutions Logo"
    className="w-32 h-auto" // Adjust width as needed
  />
  <p className="text-black-400 text-sm mt-1">
    Empowering farmers with technology for a sustainable future.
  </p>
</div>
  
            {/* Center Section */}
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium">Quick Links</h3>
              <ul className="mt-2 space-y-1">
                <li><a href="#" className="text-black-400 hover:text-black text-sm">Home</a></li>
                <li><a href="#" className="text-black-400 hover:text-black text-sm">About</a></li>
                <li><a href="#" className="text-black-400 hover:text-black text-sm">Services</a></li>
                <li><a href="#" className="text-black-400 hover:text-black text-sm">Contact</a></li>
              </ul>
            </div>
  
            {/* Right Section */}
            <div>
      <h3 className="text-lg font-medium">Follow Us</h3>
      <div className="flex space-x-4 mt-2">
        <a href="#" className="text-black-400 hover:text-black">
          <FaFacebook className="text-xl" />
        </a>
        <a href="#" className="text-black-400 hover:text-black">
          <FaTwitter className="text-xl" />
        </a>
        <a href="#" className="text-black-400 hover:text-black">
          <FaDiscord className="text-xl" />
        </a>
      </div>
    </div>
          </div>
  
          {/* Bottom Section */}
          <div className="mt-6   pt-4 text-center text-black-500 text-sm">
            © {new Date().getFullYear()} AgriGIS Solutions. All Rights Reserved.
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  