import React from "react";

const AboutCommitment = () => {
  return (
    <section className="bg-green-600 text-white py-16 text-center "data-aos="fade-up">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-medium" data-aos="fade-up">
          Our Commitment
        </h2>
        <p className="mt-4 text-lg leading-relaxed" data-aos="fade-up">
          We are committed to providing{" "}
          <span className="font-medium">demonstrations, training, and ongoing support</span>{" "}
          to ensure AgriGIS is seamlessly implemented for farmers in Bago City.
          Join us in advancing agricultural technology!
        </p>
        <button
          className="mt-6 px-6 py-3 bg-white text-green-600 font-medium rounded-md shadow hover:bg-opacity-80 transition"
          data-aos="fade-up"
        >
          Get Involved
        </button>
      </div>
    </section>
  );
};

export default AboutCommitment;
