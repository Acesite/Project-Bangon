import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

const ContactForm = () => {
  return (
    <section className="py-16 bg-white flex justify-center mb-5  " data-aos="fade-up">
      <div className="w-full max-w-5xl bg-white rounded-lg  overflow-hidden">
        {/* Header Section */}
        <div className="bg-white-600 text-green-600  py-12 px-8 text-center">
          <h2 className="text-3xl font-semibold">Get In Touch</h2>
          <p className="mt-2">
            Feel free to contact us! Submit your queries here, and we will get back to you as soon as possible.
          </p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Side - Contact Details */}
          <div className="w-full md:w-1/2 p-8">
            <div className="space-y-6 text-gray-700">
              <div className="flex items-center gap-3">
                <FaPhone className="text-green-600 text-xl" />
                <span>+9637555962</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-green-600 text-xl" />
                <span>AgriGIS@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-green-600 text-xl" />
                <span>Mansiligan, East Homes 4, Bacolod City</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-green-600 hover:text-green-800">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800">
                <FaLinkedin size={24} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="w-full md:w-1/2 p-8  rounded-lg ">
            <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
            <form>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
                />
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
