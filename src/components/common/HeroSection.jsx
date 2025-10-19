import React from 'react';
import { Link } from 'react-router-dom';
import Vector from '../../assets/Vector.png';
import phoneImage from '../../assets/phone.png';
import desktopImage from '../../assets/desktop.png';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vector Background */}
      <div className="absolute inset-0">
        <img 
          src={Vector} 
          alt="Vector background" 
          className="w-full object-cover"
        />
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center pt-14 xl:pt-14 2xl:pt-52 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              {/* Main Headline */}
              <h1 className="!font-sans !font-black text-[87px] leading-[96%] tracking-[-4%] text-[#3A3A3A]">
                Build your future, one<br />
                capstone at a time
              </h1>
              
              {/* Description */}
              <p className="!font-sans text-[18px] leading-[34px] tracking-[0px] text-black/60 max-w-lg">
                Find teammates across majors, connect with mentors, and manage milestones—so you learn faster and deliver better.
              </p>
              
              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/start" 
                  className="!font-sans bg-[#11253E] text-white px-4 py-2 rounded-[32px] text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Start now</span>
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </Link>
                
                <Link 
                  to="/how-it-works" 
                  className="text-gray-900 text-lg font-medium flex items-center font-sans"
                >
                  See how it works
                </Link>
              </div>
            </div>
            
            {/* Right Content - Device Images */}
            <div className="pl-40 relative lg:block hidden">
              <div className="relative w-full h-[600px]">
                
                {/* Phone Image */}
                <div className="absolute top-0 left-0 transform z-20">
                  <img 
                    src={phoneImage} 
                    alt="Phone mockup" 
                    className="w-96 h-auto drop-shadow-2xl"
                  />
                </div>
                
                {/* Desktop Image */}
                <div className="absolute pl-60 top-[-30px] right-[-700px] scale-125 z-10">
                  <img 
                    src={desktopImage} 
                    alt="Desktop mockup" 
                    className="w-[800px] h-auto drop-shadow-2xl rounded-[12px]"
                  />
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
