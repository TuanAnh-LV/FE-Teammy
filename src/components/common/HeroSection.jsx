import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import heroImage from "../../assets/banner.png";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-[65vh] flex items-center justify-center overflow-hidden lg:mt-20 ">
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col space-y-8">
            {/* Headline */}
            <h1
              className="!font-sans !font-black text-[42px] md:text-[54px] !leading-[120%] !tracking-tight "
              style={{
                background: "linear-gradient(90deg,#3182ED,#43D08A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("heroBuildYourFuture") ||
                "Build your future, one capstone at a time."}
            </h1>
            {/* Description */}
            <p className="!font-sans text-[16px] md:text-[18px] leading-[28px] ">
              {t("heroDescription") ||
                "Find teammates across majors, connect with mentors, and manage milestones—so you learn faster and deliver better."}
            </p>

            {/* Buttons & Stats */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Link
                  to="/discover"
                  className="!font-sans inline-flex items-center justify-center px-6 py-2.5 rounded-full text-base font-semibold text-white"
                  style={{
                    background: "linear-gradient(90deg,#43D08A,#3182ED)",
                    WebkitBackgroundClip: "border-box",
                  }}
                >
                  <span>{t("startMatching") || "Start Matching"}</span>
                  <span className="ml-2">→</span>
                </Link>

                <Link
                  to="/how-it-works"
                  className="text-gray-700 text-base !font-medium !font-sans hover:text-blue-600 transition-colors duration-200"
                >
                  {t("seeHowItWorks") || "See How It Works"}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <span>{t("hero1000Students") || "1000+ students"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">👨‍🏫</span>
                  <span>{t("hero50Mentors") || "50+ mentors"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>{t("hero300Projects") || "300+ projects"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:flex items-center justify-center">
            <img
              src={heroImage}
              alt="Students collaborating"
              className="w-full h-auto max-w-5xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
