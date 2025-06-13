import React from "react";

const benefits = [
    { 
      title: "Improved Farm Productivity", 
      description: "Enhance crop yields and operational efficiency through precise geographical data analysis.",
      image: "/images/benefit1.jpg"
    },
    { 
      title: "Optimized Resource Allocation", 
      description: "Ensure efficient use of water, fertilizers, and land with data-driven GIS insights.",
      image: "/images/benefit2.jpg"
    },
    { 
      title: "Crop Mapping & Insights", 
      description: "View detailed records of crop types planted across barangays in Bago City.",
      image: "/images/benefit3.jpg"
    },
    { 
      title: "Sustainable & Eco-Friendly Practices", 
      description: "Minimize waste and maximize resource efficiency to promote long-term agricultural sustainability.",
      image: "/images/benefit4.jpg"
    }
  ];
  
  const BenefitsSection = () => {
    return (
      <section className="w-[1350px] size-10 mx-auto py-16 px-6 " data-aos="fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-green-600" >Key Benefits of Our System</h2>
          <p className="text-gray-600 mt-2">Empowering farmers with advanced technology for smarter agriculture.</p>
        </div>
        <div className="flex justify-between gap-6 px-4 items-stretch">
  {benefits.map((benefit, index) => (
    <div key={index} className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-80 h-[420px]">
      <div className="p-4 flex-grow">
        <h3 className="mb-2 text-green-600 text-lg font-semibold ">{benefit.title}</h3>
        <p className="text-slate-600 text-base leading-normal font-medium">{benefit.description}</p>
      </div>
      <div className="relative h-48 m-2.5 overflow-hidden rounded-md">
        <img src={benefit.image} alt="card-image" className="w-full h-full object-cover" />
      </div>
    </div>
  ))}
</div>


      </section>
    );
  };
  
  export default BenefitsSection;