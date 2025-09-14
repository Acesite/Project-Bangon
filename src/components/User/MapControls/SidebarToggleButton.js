import React from "react";

const SidebarToggleButton = ({ onClick, isSidebarVisible, sidebarWidth = 500, peek = 12 }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-1/2 -translate-y-1/2 bg-white border border-green-600 rounded-r-full
                 w-6 h-20 flex items-center justify-center shadow-md transition-all hover:bg-green-100
                 z-10" // lower than sidebar's z-40 -> goes behind it
      style={{
        left: isSidebarVisible ? `${sidebarWidth - peek}px` : "0px",
      }}
      aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
    >
      <svg
        className={`w-5 h-5 text-green-600 transition-transform duration-200 ${
          isSidebarVisible ? "rotate-0" : "rotate-180"
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
