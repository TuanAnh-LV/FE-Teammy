import React from "react";
import { useTranslation } from "../../hook/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* --- Column 1: Brand Info --- */}
        <div>
          <h2 className="text-[#0A2540] !text-[24px] !font-black !tracking-[-4%] mb-3">
            Teammy.
          </h2>
          <p className="text-black/70 text-[15px] font-bold leading-[26px] max-w-xs">
            {t("footerTagline")}
          </p>
        </div>

        {/* --- Column 2: Features --- */}
        <div>
          <h3 className="text-black !font-bold !text-[15px] mb-4">
            {t("footerFeaturesTitle")}
          </h3>
          <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerFeatureFindTeammates")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerFeatureChooseMentors")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerFeatureProjectManagement")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerFeatureTeamCommunication")}
            </li>
          </ul>
        </div>

        {/* --- Column 3: Support --- */}
        <div>
          <h3 className="text-black !font-bold !text-[15px] mb-4">
            {t("footerSupportTitle")}
          </h3>
          <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerSupportHelpCenter")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerSupportGuides")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerSupportFAQs")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerSupportContact")}
            </li>
          </ul>
        </div>

        {/* --- Column 4: Connect --- */}
        <div>
          <h3 className="text-black !font-bold !text-[15px] mb-4">
            {t("footerConnectTitle")}
          </h3>
          <ul className="space-y-2 text-black/70 font-bold text-[15px] leading-[26px]">
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerConnectFacebook")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerConnectLinkedIn")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerConnectEmail")}
            </li>
            <li className="hover:text-gray-900 transition cursor-pointer">
              {t("footerConnectGithub")}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
