import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/users/login", { email, password });

      if (response.data?.token) {
        const { token, role, id, first_name, last_name, profile_picture } = response.data;

        // Base user info
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("first_name", first_name);
        localStorage.setItem("last_name", last_name);
        localStorage.setItem("profile_picture", profile_picture || "");
        localStorage.setItem("user_id", String(id));

        // ✅ Also store admin_id for admins/super_admins
        if (role === "admin" || role === "super_admin") {
          localStorage.setItem("admin_id", String(id));
        } else {
          localStorage.removeItem("admin_id");
        }

        // Redirect by role
        if (role === "super_admin") {
          navigate("/SuperAdminLandingPage");
        } else if (role === "admin") {
          navigate("/AdminLanding");
        } else {
          navigate("/UserLandingPage");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
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

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-green-600 font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@gmail.com"
                className="w-full p-3 border rounded-lg"
                required
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
                required
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
            loop
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
