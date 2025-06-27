import React from "react";

const SidebarToggleButton = ({ onClick, isSidebarVisible }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 bg-white border border-green-600 rounded-r-full w-6 h-20 flex items-center justify-center shadow-md z-50 transition-all hover:bg-green-100"
      style={{
        left: isSidebarVisible ? '20px' : '0px', // adjust based on your actual sidebar width
      }}
    >
      <svg
        className={`w-5 h-5 text-green-600 transition-transform duration-200 ${
          isSidebarVisible ? 'rotate-0' : 'rotate-180'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default SidebarToggleButton;
