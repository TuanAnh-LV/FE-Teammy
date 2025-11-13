import React from "react";
import { Sparkles, Target, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const stats = [
    { number: "500+", label: t("statsActiveProjects") },
    { number: "2,000+", label: t("statsStudents") },
    { number: "95%", label: t("statsSuccessRate") },
  ];

  const features = [
    {
      icon: <Sparkles className="!w-7 !h-7 !text-white" />,
      title: t("featureAIMatchingTitle"),
      desc: t("featureAIMatchingDesc"),
    },
    {
      icon: <Target className="!w-7 !h-7 !text-white" />,
      title: t("featureProjectManagementTitle"),
      desc: t("featureProjectManagementDesc"),
    },
    {
      icon: <MessageSquare className="!w-7 !h-7 !text-white" />,
      title: t("featureRealtimeChatTitle"),
      desc: t("featureRealtimeChatDesc"),
    },
    {
      icon: <Users className="!w-7 !h-7 !text-white" />,
      title: t("featureSkillTrackingTitle"),
      desc: t("featureSkillTrackingDesc"),
    },
  ];

  return (
    <section className="!bg-[#f7fafc] !pt-0 !pb-24">
      {/* Stats Section - full width white */}
      <div className="!w-full !bg-white !py-16">
        <div className="!max-w-6xl !mx-auto !grid !grid-cols-1 md:!grid-cols-3 !gap-12 !text-center">
          {stats.map((item, idx) => (
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
          {t("featuresTitle")}
        </h2>
        <p className="!text-gray-500 !mt-3 !text-[17px]">
          {t("featuresSubtitle")}
        </p>
      </div>

      {/* Feature grid */}
      <div className="!max-w-[90rem] !mx-auto !grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-10 !px-10 !items-stretch">
        {features.map((feature, index) => (
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
