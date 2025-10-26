import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#f7fafc]">
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl space-y-10 ">
        {/* Headline */}
        <h1 className="!font-sans !font-black text-[48px] md:text-[72px] !leading-[106%] !tracking-[-4%] text-[#3A3A3A] text-center !mb-2">
          Empowering Students to{" "}
          <span className="block md:inline bg-gradient-to-r from-[rgb(66,100,215)] to-[rgb(76,205,187)] bg-clip-text text-transparent">
            Connect, Collaborate, and Create
          </span>
        </h1>


        {/* Description */}
        <p className="!font-sans text-[18px] md:text-[20px] leading-[34px] tracking-[0px] text-black/60 max-w-2xl">
          Find the perfect teammates and projects with AI-powered <br />
          recommendations. Build amazing things together.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link
            to="/start"
            className="!font-sans bg-[#4264d7] text-white px-6 py-2 rounded-[10px] text-lg font-semibold flex items-center justify-center space-x-2 hover:bg-[#1c355c] transition-colors duration-200"
          >
            <span>Get Started</span>
          </Link>

          <Link
            to="/how-it-works"
            className="text-gray-900 text-lg !font-medium flex items-center !font-sans px-6 py-2 !border-[0.1px] !border-b-gray-500 rounded-[8px] hover:text-blue-600 transition-colors duration-200"
          >
            Sign in with Google
          </Link>
        </div>

        {/* “Already have an account?” text */}
        <p className="text-center text-gray-500 text-sm font-sans">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#4264d7] font-medium hover:underline hover:text-[#2f4cc1]"
          >
            Sign in
          </Link>
        </p>


      </div>

      {/* Optional background illustration (if you want images) */}
      {/* 
      <img
        src={desktopImage}
        alt="desktop"
        className="absolute right-0 bottom-0 w-[600px] hidden lg:block opacity-80"
      />
      <img
        src={phoneImage}
        alt="phone"
        className="absolute left-0 bottom-0 w-[280px] hidden md:block opacity-90"
      /> 
      */}
    </div>
  );
};

export default HeroSection;
