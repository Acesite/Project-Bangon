import React from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="flex h-[850px] items-center justify-center bg-gray-100 font-poppins">
  <div className="flex w-[1100px] h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
    
    {/* Right Side - Sign Up Form */}
    <div className="w-[55%] p-10 flex flex-col justify-center"> 
      <div className="flex justify-center mb-2"> 
        <img src="/images/AgriGIS.png" alt="Logo" className="h-[100px] w-auto" />
      </div>

      <h2 className="text-3xl font-bold text-green-700 text-center">Create an Account</h2>
      <p className="text-gray-500 text-center mb-6">
        Sign up to access <span className="text-green-700 font-semibold">AgriGIS</span>
      </p>

      <form>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-green-600 font-medium">First Name</label>
            <input type="text" placeholder="John" className="w-full p-3 border rounded-lg" />
          </div>
          <div className="w-1/2">
            <label className="block text-green-600 font-medium">Last Name</label>
            <input type="text" placeholder="Doe" className="w-full p-3 border rounded-lg" />
          </div>
        </div>

        <div className="mb-4 mt-4">
          <label className="block text-green-600 font-medium">Email address</label>
          <input type="email" placeholder="name@gmail.com" className="w-full p-3 border rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="block text-green-600 font-medium">Password</label>
          <input type="password" placeholder="********" className="w-full p-3 border rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="block text-green-600 font-medium">Confirm Password</label>
          <input type="password" placeholder="********" className="w-full p-3 border rounded-lg" />
        </div>

        <button className="w-full bg-green-500 text-white p-3 rounded-lg mb-4 hover:bg-green-800 active:bg-green-500">Sign up</button>

      </form>

      <p className="text-gray-500 text-center mt-4">
        Already have an account? <Link to="/" className="text-green-600">Log in here</Link>
      </p>
    </div>

    {/* Left Side - Image */}
    <div className="w-[45%] hidden lg:block">
      <img src="/images/Logimage.jpg" alt="Farmers in Field" className="w-full h-full object-cover" />
    </div>
  </div>
</div>

  );
};

export default SignUp;
