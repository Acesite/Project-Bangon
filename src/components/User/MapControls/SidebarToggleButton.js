import React from "react";

const SidebarToggleButton = ({ onClick, isSidebarVisible }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-0 bg-white border border-green-600 rounded-r-full w-6 h-20 flex items-center justify-center shadow-md z-50 transition-all hover:bg-green-100"
    >
      <svg
        className={`w-5 h-5 text-green-600 transition-transform duration-200 ${!isSidebarVisible ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};


export default SidebarToggleButton;
