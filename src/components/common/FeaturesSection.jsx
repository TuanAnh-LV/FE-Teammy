import React from "react";
import { Sparkles, Target, MessageSquare, Users } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="!bg-[#f7fafc] !pt-0 !pb-24">
      {/* Stats Section - full width white */}
      <div className="!w-full !bg-white !py-16">
        <div className="!max-w-6xl !mx-auto !grid !grid-cols-1 md:!grid-cols-3 !gap-12 !text-center">
          {[
            { number: "500+", label: "Active Projects" },
            { number: "2,000+", label: "Students" },
            { number: "95%", label: "Success Rate" },
          ].map((item, idx) => (
            <div key={idx}>
              <h2 className="!text-[48px] !mb-2 !font-extrabold !bg-gradient-to-r !from-[rgb(66,100,215)] !to-[rgb(76,205,187)] !bg-clip-text !text-transparent">
                {item.number}
              </h2>
              <p className="!text-gray-600 !text-[14px]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section title */}
      <div className="!text-center !mt-20 !mb-14">
        <h2 className="!text-[32px] md:!text-[36px] !font-black !text-[#1a1a1a]">
          Everything you need to succeed
        </h2>
        <p className="!text-gray-500 !mt-3 !text-[17px]">
          Powerful features to help you manage your projects and collaborate effectively.
        </p>
      </div>

      {/* Feature grid */}
      <div className="!max-w-[90rem] !mx-auto !grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-10 !px-10 !items-stretch">
        {[
          {
            icon: <Sparkles className="!w-7 !h-7 !text-white" />,
            title: "AI-Powered Matching",
            desc: "Get personalized teammate and project recommendations based on your skills and interests.",
          },
          {
            icon: <Target className="!w-7 !h-7 !text-white" />,
            title: "Project Management",
            desc: "Track progress, manage tasks, and collaborate seamlessly with your team.",
          },
          {
            icon: <MessageSquare className="!w-7 !h-7 !text-white" />,
            title: "Real-time Chat",
            desc: "Stay connected with instant messaging and file sharing capabilities.",
          },
          {
            icon: <Users className="!w-7 !h-7 !text-white" />,
            title: "Skill Tracking",
            desc: "Showcase your abilities and find teammates with complementary skills.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="!bg-white !shadow-sm hover:!shadow-md !transition-all !duration-200 !rounded-2xl !px-8 !py-8 !text-left !border !border-gray-100 !flex !flex-col !h-full"
          >
            <div className="!flex !items-center !justify-center !w-12 !h-12 !rounded-xl !mb-5 !bg-gradient-to-r !from-[rgb(66,100,215)] !to-[rgb(76,205,187)]">
              {feature.icon}
            </div>
            <h3 className="!text-lg !font-semibold !text-gray-900 !mb-2">
              {feature.title}
            </h3>
            <p className="!text-gray-500 !text-sm !leading-relaxed !tracking-[-10%] !flex-grow">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
