import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-hot-toast";

// Validation Schema using Yup
const schema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/signup", data);
      if (response.data.success) {
        toast.success("Account Created successfully!", {
          position: "top-center", 
        });       
         navigate("/login");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-poppins">
      <div className="flex w-[1200px] h-[720px] bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Right Side - Sign Up Form */}
        <div className="w-[55%] p-10 flex flex-col justify-center"> 
          <div className="flex justify-center mb-2"> 
            <img src="/images/AgriGIS.png" alt="Logo" className="h-[100px] w-auto" />
          </div>

          <h2 className="text-3xl font-bold text-green-700 text-center">Create an Account</h2>
          <p className="text-gray-500 text-center mb-6">
            Sign up to access <span className="text-green-700 font-semibold">AgriGIS</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-green-600 font-medium">First Name</label>
                <input {...register("firstName")} type="text" className="w-full p-3 border rounded-lg" placeholder="John Doe" />
                <p className="text-red-500 text-sm">{errors.firstName?.message}</p>
              </div>
              <div className="w-1/2">
                <label className="block text-green-600 font-medium">Last Name</label>
                <input {...register("lastName")} type="text" className="w-full p-3 border rounded-lg" placeholder="Balagbag" />
                <p className="text-red-500 text-sm">{errors.lastName?.message}</p>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <label className="block text-green-600 font-medium">Email address</label>
              <input {...register("email")} type="email" className="w-full p-3 border rounded-lg" placeholder="example@gmail.com"/>
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div className="mb-4 relative">
              <label className="block text-green-600 font-medium">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full p-3 border rounded-lg pr-10"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)} // Update state when typing
                />
                {passwordValue && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                )}
              </div>
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            <div className="mb-4 relative">
              <label className="block text-green-600 font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full p-3 border rounded-lg pr-10"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)} // Update state when typing
                />
                {passwordValue && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                )}
              </div>
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-3 rounded-lg mb-4 hover:bg-green-800 active:bg-green-500"
            >
              Sign up
            </button>
          </form>

          <p className="text-gray-500 text-center mt-4">
            Already have an account? <Link to="/login" className="text-green-600">Log in here</Link>
          </p>
        </div>

        {/* Left Side - Image Carousel */}
        <div className="w-[50%] hidden lg:block relative">
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

export default SignUp;
