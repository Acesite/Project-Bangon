import React from "react";
import FeatureCard from "./FeatureCard"; // Import FeatureCard component
import { Map, Search, BarChart2, Database } from "lucide-react"; // Import icons

const KeyFeatures = () => {
  const features = [
    {
      icon: Map,
      title: "GIS Crop Mapping",
      description: "View farmland locations and track planted crops in real-time.",
    },
    {
      icon: Search,
      title: "Interactive Crop Details",
      description: "Click on a farmland location to see crop type, estimated harvest, and more.",
    },
    {
      icon: BarChart2,
      title: "Crop Yield Estimation",
      description: "Predict harvest output based on crop type and location data.",
    },
    {
      icon: Database,
      title: "Data-Driven Farming",
      description: "Make informed agricultural decisions with real-time insights.",
    },
  ];

  return (
    <section className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">Key Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
        {features.map((feature, index) => (
          <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
        ))}
      </div>
    </section>
  );
};

export default KeyFeatures;
