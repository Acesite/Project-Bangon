import React from "react";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-poppins">
      <div className="flex w-[1100px] h-[670px] bg-white rounded-xl shadow-lg overflow-hidden">
        

        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">

          <div className="flex justify-center mb-2"> 
  <img src="/images/AgriGIS.png" alt="Logo" className="h-[100px] w-auto" />
</div>

          {/* <h2 className="text-3xl font-bold text-green-700 text-center">Welcome back</h2> */}
          <p className="text-gray-500 text-center mb-6">
       Welcome to <span className="text-green-700 font-semibold">AgriGIS</span>, please enter your account nigga.
</p>

          <form>
            <div className="mb-4">
              <label className="block text-green-600 font-medium">Email address</label>
              <input
                type="email"
                placeholder="name@gmail.com"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-green-600 font-medium">Password</label>
              <input
                type="password"
                placeholder="********"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-gray-500">
                <input type="checkbox" className="mr-2 " /> Remember me
              </label>
              <a href="#" className="text-green-600">Forgot password?</a>
            </div>

            <button className="w-full bg-green-500 text-white p-3 rounded-lg mb-4 hover:bg-green-800 active:bg-green-500">Log in</button>
            <button className="w-full flex justify-center items-center border p-3 rounded-lg">
              <img src="/images/google.png" alt="Google" className="h-5 mr-2" /> Log in with Google
            </button>
          </form>

          <p className="text-gray-500 text-center mt-4">
            Don’t have an account? <a href="signup" className="text-green-600">Sign up here</a>
          </p>
        </div>

        <div className="w-1/2 hidden lg:block relative">
  {/* Background Image */}
  <img
    src="/images/Logimage.jpg"
    alt="Farmers in Field"
    className="w-full h-full object-cover mix-blend-multiply"
  />
  {/* Black Overlay */}
  <div className="absolute inset-0 bg-black opacity-5"></div>
</div>

      </div>
    </div>
  );
};

export default Login;
