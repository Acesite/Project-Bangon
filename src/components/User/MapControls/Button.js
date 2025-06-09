import React from "react";
import { Link } from "react-router-dom";

const FancyButtonLink = ({ to, label = "Click Me" }) => {
  return (
    <Link to="/">
            <button class="relative inline-block group">
            <span
            class="relative z-10 px-3.5 py-2 overflow-hidden font-medium leading-tight flex items-centrer justify-center text-green-600 transition-colors duration-300 ease-out border-2 border-green-600 rounded-lg group-hover:text-white">
            <span class="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
            <span
            class="absolute left-0 w-40 h-40 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-green-600 group-hover:-rotate-180 ease"></span>
            <span class="relative text-base font-poppins"> Home</span>
            </span>
            <span
            class="absolute bottom-0 right-0 w-full h-9 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-600 rounded-lg group-hover:mb-0 group-hover:mr-0 group-hover:mb-2"
            data-rounded="rounded-lg"></span>
            </button>
            </Link>
  );
};

export default FancyButtonLink;
