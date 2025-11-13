import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#f7fafc]">
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl space-y-10 ">
        {/* Headline */}
        <h1 className="!font-sans !font-black text-[48px] md:text-[72px] !leading-[106%] !tracking-[-4%] text-[#3A3A3A] text-center !mb-2">
          {t("heroHeadlinePrefix")}
          <span className="block md:inline bg-gradient-to-r from-[rgb(66,100,215)] to-[rgb(76,205,187)] bg-clip-text text-transparent">
            {" "}
            {t("heroHeadlineHighlight")}
          </span>
        </h1>

        {/* Description */}
        <p className="!font-sans text-[18px] md:text-[20px] leading-[34px] tracking-[0px] text-black/60 max-w-2xl">
          {t("heroDescription")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link
            to="/start"
            className="!font-sans bg-[#4264d7] text-white px-6 py-2 rounded-[10px] text-lg font-semibold flex items-center justify-center space-x-2 hover:bg-[#1c355c] transition-colors duration-200"
          >
            <span>{t("heroPrimaryCta")}</span>
          </Link>

          <Link
            to="/how-it-works"
            className="text-gray-900 text-lg !font-medium flex items-center !gap-3 !font-sans px-6 py-2 !border !border-gray-300 rounded-[8px] hover:text-blue-600 hover:border-blue-400 transition-colors duration-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M12.24 5.04a6.72 6.72 0 0 1 4.53 1.7l3.38-3.38A11.32 11.32 0 0 0 12.24 1C7.4 1 3.27 3.78 1.36 7.95l3.95 3.07c.94-2.85 3.6-5.98 6.93-5.98Z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.27a11.9 11.9 0 0 0-.17-2.1H12.24v4h6.42a5.5 5.5 0 0 1-2.4 3.6l3.69 2.86c2.15-1.98 3.55-4.91 3.55-8.36Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.4a6.68 6.68 0 0 1-.36-2.07c0-.72.12-1.42.34-2.07L1.35 7.19A11.19 11.19 0 0 0 .04 12.33c0 1.7.41 3.3 1.13 4.72Z"
                />
                <path
                  fill="#34A853"
                  d="M12.24 23.67c3.04 0 5.6-1 7.47-2.76l-3.69-2.86c-1.02.7-2.33 1.13-3.78 1.13-3.3 0-6.08-2.23-7.08-5.34l-3.95 3.07c1.86 4.15 5.99 6.76 10.03 6.76Z"
                />
              </svg>
            </span>
            {t("heroSecondaryCta")}
          </Link>
        </div>

        {/* Login prompt */}
        <p className="text-center text-gray-500 text-sm font-sans">
          {t("heroLoginPrompt")}{" "}
          <Link
            to="/login"
            className="text-[#4264d7] font-medium hover:underline hover:text-[#2f4cc1]"
          >
            {t("signIn")}
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
