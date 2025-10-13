import React from 'react';

const FeaturesSection = () => {
  return (
    <div className="pb`-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-left mb-16">
          <h2 className="font-sans font-bold text-[56px] leading-[72px] tracking-[-4%] text-black">
            Made for modern<br />
            capstone teams
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-8 h-8 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-sans font-bold text-[20px] leading-[140%] tracking-[0px] text-black">
              Form teams, smart & fair
            </h3>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-8 h-8 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-sans font-bold text-[20px] leading-[140%] tracking-[0px] text-black">
              Ship milestones faster
            </h3>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-8 h-8 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-sans font-bold text-[20px] leading-[140%] tracking-[0px] text-black">
              Guided by mentors
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
