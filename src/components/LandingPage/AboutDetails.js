import React from "react";

const AboutDetails = () => {
  return (
    <section className="py-24 relative">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center gap-8 grid lg:grid-cols-2 grid-cols-1">
          
          {/* Text Content Section */}
          <div className="w-full flex flex-col justify-start lg:items-start items-center gap-10">
            <div className="w-full flex flex-col justify-start lg:items-start items-center gap-4">
              <h2 
                className="text-green-600 text-4xl font-medium leading-normal lg:text-start text-center" 
                data-aos="fade-up"
              >
                About AgriGIS
              </h2>
              <p 
                className="text-gray-600 text-lg leading-relaxed lg:text-start text-center" 
                data-aos="fade-up"
              >
                AgriGIS is a capstone project developed by IT students at La Consolacion College - Bacolod. 
                We integrate <span className="font-medium text-green-600">Geographical Information System (GIS) technology</span>&nbsp;
                to modernize farm management and enhance agricultural productivity.
              </p>
            </div>

            {/* Vision & Mission */}
            <div className="w-full grid md:grid-cols-2 gap-12" data-aos="fade-up">
              <div>
                <h3 className="text-xl font-medium text-green-700">Our Vision</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Empowering farmers with technology that improves decision-making, crop monitoring, 
                  and agricultural efficiency.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-green-700">Our Mission</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  Providing a <span className="font-medium text-green-600">real-time crop management system</span>&nbsp;
                  that allows farmers to track, analyze, and optimize their farming activities.
                </p>
              </div>
            </div>

            {/* Call to Action Button */}
            <button class="relative inline-block group" data-aos="fade-up">
<span
class="relative z-10 px-3.5 py-2 overflow-hidden font-medium leading-tight flex items-centrer justify-center text-green-600 transition-colors duration-300 ease-out border-2 border-green-600 rounded-lg group-hover:text-white">
<span class="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
<span
  class="absolute left-0 w-40 h-40 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-green-600 group-hover:-rotate-180 ease"></span>
<span class="relative text-base font-poppins">Get Started</span>
</span>
<span
class="absolute bottom-0 right-0 w-full h-9 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-green-600 rounded-lg group-hover:mb-0 group-hover:mr-0 group-hover:mb-2"
data-rounded="rounded-lg"></span>
</button>
          </div>

          {/* Image Section */}
          <img 
  className="lg:mx-0 mx-auto w-[1200px] h-[500px] rounded-2xl object-cover"
  src="/images/aboutus.jpg" 
  alt="About AgriGIS"
  data-aos="fade-left"
/>

        </div>
      </div>
    </section>
  );
};

export default AboutDetails;
