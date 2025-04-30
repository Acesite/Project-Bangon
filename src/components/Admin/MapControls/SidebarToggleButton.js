import React from "react";

const SidebarToggleButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg z-50"
    >
      <svg
        className="w-5 h-5 text-gray-800"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export default SidebarToggleButton;
