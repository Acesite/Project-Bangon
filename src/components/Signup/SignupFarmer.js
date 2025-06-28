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
import { toast } from "react-hot-toast";

// Validation Schema
const schema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  sex: yup.string().required("Sex is required"),
});

const SignUpFarmer = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    if (!profilePic) {
      setProfilePicError("Profile picture is required.");
      return;
    }
    setProfilePicError(""); 

    try {
      const formData = new FormData();
      for (let key in data) {
        formData.append(key, data[key]);
      }
      formData.append("profile_picture", profilePic);

      const response = await axios.post("http://localhost:5000/api/farmers/signup-farmer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data.success) {
        toast.success("Farmer account created successfully!", { position: "top-center" });
        navigate("/login");
      }
    } catch (error) {
        if (error.response?.status === 409) {
          toast.error("Mobile number already exists.", { position: "top-center" });
        } else {
          toast.error("Failed to sign up. Please try again.", { position: "top-center" });
        }
        console.error(error);
      }
      
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-poppins">
      <div className="flex w-[1450px] h-[950px]   overflow-hidden">

        {/* Left Side - Form */}
        <div className="w-[55%] p-10 flex flex-col justify-center">
          <div className="flex justify-center mb-2">
            <img src="/images/AgriGIS.png" alt="Logo" className="h-[100px] w-auto" />
          </div>

          <h2 className="text-3xl font-bold text-green-700 text-center">Farmer's Profile</h2>
          <p className="text-gray-500 text-center mb-6">
            Sign up to access <span className="text-green-700 font-semibold">AgriGIS</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Profile Picture Attachment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Profile Picture (File Attachment)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
              />
              {profilePicError && (
                <p className="text-sm text-red-500 mt-1">{profilePicError}</p>
              )}
            </div>

            {/* Name Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Surname (Apelyido)</label>
                <input {...register("last_name")} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">First Name (Pangalan)</label>
                <input {...register("first_name")} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Middle Name (Gitnang Pangalan)</label>
                <input {...register("middle_name")} className="w-full border rounded-md p-2" />
                <label className="inline-flex items-center text-sm mt-2">
                  <input type="checkbox" {...register("no_middle_name")} className="mr-2" />
                  No Middle Name
                </label>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Extension Name</label>
                <input {...register("extension_name")} className="w-full border rounded-md p-2" />
                <label className="inline-flex items-center text-sm mt-2">
                  <input type="checkbox" {...register("no_extension_name")} className="mr-2" />
                  No Extension Name
                </label>
              </div>
            </div>

            {/* Sex Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Sex (Kasarian)</label>
              <div className="flex space-x-6 mt-1">
                <label className="inline-flex items-center">
                  <input type="radio" {...register("sex")} value="Male" className="mr-2" />
                  Male (Lalaki)
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" {...register("sex")} value="Female" className="mr-2" />
                  Female (Babae)
                </label>
              </div>
              <p className="text-red-500 text-sm">{errors.sex?.message}</p>
            </div>

            {/* Mobile Number & Password */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
    <input
      type="text"
      {...register("mobile_number")}
      className="w-full border rounded-md p-2"
      placeholder="09XXXXXXXXX"
    />
  </div>
  <div>
    <label className="text-sm font-semibold text-gray-700">Password</label>
    <input
      type="password"
      {...register("password")}
      className="w-full border rounded-md p-2"
      placeholder="Enter a password"
    />
  </div>
</div>


            {/* Address Section */}
            <div className="grid grid-cols-3 gap-4">
  <div>
    <label className="text-sm font-semibold text-gray-700">House/Lot/Building No./Purok</label>
    <input {...register("house_number")} className="w-full border rounded-md p-2" />
  </div>
  <div>
    <label className="text-sm font-semibold text-gray-700">Street/Sitio/Subdivision</label>
    <input {...register("street")} className="w-full border rounded-md p-2" />
  </div>

  <div>
  <label className="text-sm font-semibold text-gray-700">Barangay</label>
  <select {...register("barangay")} className="w-full border rounded-md p-2 bg-white">
    <option value="">Select Barangay</option>
    <option value="Abuanan">Abuanan</option>
    <option value="Alianza">Alianza</option>
    <option value="Atipuluan">Atipuluan</option>
    <option value="Bacong">Bacong</option>
    <option value="Bagroy">Bagroy</option>
    <option value="Balingsag">Balingsag</option>
    <option value="Binubuhan">Binubuhan</option>
    <option value="Busay">Busay</option>
    <option value="Calumangan">Calumangan</option>
    <option value="Caridad">Caridad</option>
    <option value="Dulao">Dulao</option>
    <option value="Ilijan">Ilijan</option>
    <option value="Lag-asan">Lag-asan</option>
    <option value="Mailum">Mailum</option>
    <option value="Ma-ao">Ma-ao</option>
    <option value="Malingin">Malingin</option>
    <option value="Napoles">Napoles</option>
    <option value="Pacol">Pacol</option>
    <option value="Poblacion">Poblacion</option>
    <option value="Sagasa">Sagasa</option>
    <option value="Tabunan">Tabunan</option>
    <option value="Taloc">Taloc</option>
    <option value="Talon">Talon</option>
    <option value="Tinongan">Tinongan</option>
  </select>
</div>

  <div>
    <label className="text-sm font-semibold text-gray-700">City/Municipality</label>
    <input
      {...register("city")}
      defaultValue="Bago City"
      readOnly
      className="w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
    />
  </div>
  <div>
    <label className="text-sm font-semibold text-gray-700">Province</label>
    <input
      {...register("province")}
      defaultValue="Negros Occidental"
      readOnly
      className="w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
    />
  </div>
  <div>
    <label className="text-sm font-semibold text-gray-700">Region</label>
    <input
      {...register("region")}
      defaultValue="Region VI "
      readOnly
      className="w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
    />
  </div>
</div>
            <button
                type="submit"
                className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-800 active:bg-green-500" >
                Sign up
                </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">Log in here</Link>
          </p>
        </div>

        {/* Right Side - Image Carousel */}
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
                <img src="/images/Hero.jpeg" className="w-full h-full object-cover" alt="Slide 1" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="/images/Hero2.jpg" className="w-full h-full object-cover" alt="Slide 2" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="/images/Hero3.jpg" className="w-full h-full object-cover" alt="Slide 3" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default SignUpFarmer;
