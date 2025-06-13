import React from "react";
import { FaFacebook, FaInstagram , FaGithub } from "react-icons/fa";

const teamMembers = [
  {
    name: "Nicole Martin Menez",
    role: "Front-End Developer",
    image: "./images/team1.jpg",
    socials: {
      facebook: "https://facebook.com/nicolemenez",
      linkedin: "https://linkedin.com/in/nicolemenez",
      github: "https://github.com/nicolemenez",
    },
  },
  {
    name: "Jerryl Perez",
    role: "Back-End Developer",
    image: "./images/sssss.jpg",
    socials: {
      facebook: "https://facebook.com/jerrylperez",
      linkedin: "https://linkedin.com/in/jerrylperez",
      github: "https://github.com/jerrylperez",
    },
  },
];

const MeetTheTeam = () => {
  return (
    <section className="py-24" data-aos="fade-up">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-12 text-center">
      <h2 className="font-poppins text-3xl font-medium text-green-600 -mt-10">
        Meet the Team
      </h2>
    </div>
    <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-8">
      {teamMembers.map((member, index) => (
        <div key={index} className="text-center">
          <div className="relative mb-6">
            <img
              src={member.image}
              alt={member.name}
              className="w-40 h-40 rounded-full mx-auto transition-all duration-500 object-cover border border-solid border-transparent group-hover:border-indigo-600"
            />
          </div>
          <h4 className="text-xl font-medium text-gray-900 mb-2 capitalize transition-all duration-500 hover:text-teal-600">
            {member.name}
          </h4>
          <span className="text-green-600 block mb-3 transition-all duration-500 hover:text-green-800">
            {member.role}
          </span>
          {/* Social Media Icons */}
          <div className="flex justify-center gap-4">
            <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-gray-500 hover:text-blue-600 text-xl transition-all duration-300" />
            </a>
            <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-gray-500 hover:text-pink-600 text-xl transition-all duration-300" />
            </a>
            <a href={member.socials.github} target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-gray-500 hover:text-gray-900 text-xl transition-all duration-300" />
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

  );
};

export default MeetTheTeam;
