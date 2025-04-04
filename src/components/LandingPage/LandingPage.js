import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import NavBar from "../NavBar/NavBar";
import { Map } from "lucide-react";
import KeyFeatures from "./KeyFeatures";
import BenefitsSection from "./BenefitsSection";
import Footer from "./Footer";

const images = [
  "/images/Hero.jpeg",
  "/images/Hero2.jpg",
  "/images/Hero3.jpg",
  "/images/Hero4.jpg",
];

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="w-full min-h-screen bg-white font-poppins">
      <NavBar />

      {/* Hero Section with Carousel & Content Overlay */}
      <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Swiper for Background Images */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="absolute w-full h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-[90dvh]">
                {/* Background Image */}
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-65"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Fixed Content (Text) */}
        <div className="absolute z-10 left-40 md:left-40 lg:left-40 text-left px-6 max-w-2xl">
          <h1 className="text-7xl md:text-7xl font-bold leading-[2] mb-6 text-white" data-aos="fade-up">
            Agriculture Geographical Information System
          </h1>
          <p className="mt-4 text-white text-5md" data-aos="fade-up">
            AgriGIS helps visualize farmland locations, track planted crops, and estimate harvests, empowering farmers and agricultural planners with real-time data.
          </p>
          <Link to="/Map">
            <button
              className="relative inline-flex items-center justify-center px-3.5 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out border-2 border-white rounded-xl shadow-md group mt-4"
              data-aos="fade-up"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-green-500 group-hover:translate-x-0 ease">
                <Map className="w-6 h-6" />
              </span>
              <span className="absolute flex items-center text-base font-semibold justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease tracking-widest">
                Explore
              </span>
              <span className="relative text-base font-semibold invisible">Button Text</span>
            </button>
          </Link>
        </div>
      </section>
      <KeyFeatures />
      <div className="h-[700px]">
        <BenefitsSection />
      </div>
      <div className="" data-aos="fade-up">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;