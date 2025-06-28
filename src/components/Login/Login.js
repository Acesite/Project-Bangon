import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectFade } from "swiper/modules";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Initialize useNavigate

  // Handle form input changes
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/users/login", { email, password });
      console.log("Login response:", response.data);
     if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("first_name", response.data.first_name);
      localStorage.setItem("last_name", response.data.last_name);
      localStorage.setItem("user_id", response.data.id); // ✅ Store user id
      localStorage.setItem("profile_picture", response.data.profile_picture);
      

  if (response.data.role === "super_admin") {
    navigate("/SuperAdminLandingPage");
  } else if (response.data.role === "admin") {
    navigate("/AdminLanding");
  } else {
    navigate("/UserLandingPage");
  }
}

    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };
  

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-poppins">
      <div className="flex w-[1100px] h-[670px] bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex justify-center mb-2">
            <img src="/images/AgriGIS.png" alt="Logo" className="h-[100px] w-auto" />
          </div>

          <p className="text-gray-500 text-center mb-6">
            Welcome to <span className="text-green-700 font-semibold">AgriGIS</span>, please enter your account.
          </p>

          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-green-600 font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@gmail.com"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-green-600 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="********"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-gray-500">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="text-green-600">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg mb-4 hover:bg-green-800 active:bg-green-500">
              Log in
            </button>

            {/* <button className="w-full flex justify-center items-center border p-3 rounded-lg">
              <img src="/images/google.png" alt="Google" className="h-5 mr-2" /> Log in with Google
            </button> */}
          </form>

          <p className="text-gray-500 text-center mt-4">
            Don’t have an account? <a href="ChooseRole" className="text-green-600">Sign up here</a>
          </p>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="w-1/2 hidden lg:block relative">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            spaceBetween={50}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            className="h-full"
          >
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="/images/Hero.jpeg" alt="Farmers in Field" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="/images/Hero2.jpg" alt="Farm Tools" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="/images/Hero3.jpg" alt="Harvest Scene" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Login;
