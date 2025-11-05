import React from "react";
import { Card, Input, Button, Tag, Avatar } from "antd";
import { useTranslation } from "../../hook/useTranslation";

const Profile = () => {
  const { t } = useTranslation();
  const mentorInfo = {
    name: "Tran Hai Son",
    major: "Computer Science",
    email: "sonthse172913@fpt.edu.vn",
    phone: "+1 (555) 123-4567",
    officeHours: "Mon–Wed–Fri, 2:00–4:00 PM",
    bio: "Dedicated mentor passionate about guiding students in AI and data science projects.",
    expertise: ["Machine Learning", "Deep Learning", "Data Analytics"],
    groupCapacity: "5 groups max",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
<<<<<<< Updated upstream
          <h1 className="inline-block text-4xl font-extrabold">
            Mentor Profile
          </h1>
=======
          <h1
            className="inline-block text-4xl font-extrabold"
            style={{
              backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            {t("mentorProfile")}
          </h1>
          <p className="text-gray-500 text-sm">
            {t("manageProfilePreferences")}
          </p>
>>>>>>> Stashed changes
        </div>
        <Button
          type="default"
          className="!bg-[#FF7A00] !text-white !border-none !rounded-md !px-6 !py-5 hover:!opacity-90"
        >
          {t("editProfile")}
        </Button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card: mentor summary */}
        <Card
          className="shadow-sm border-gray-100 flex flex-col items-center text-center"
          bodyStyle={{ padding: "24px" }}
        >
          <Avatar
            size={96}
            style={{
              backgroundColor: "#d9d9d9",
              color: "#444",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            {mentorInfo.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <h2 className="font-semibold text-lg mt-4 text-gray-800">
            {mentorInfo.name}
          </h2>
          <p className="text-gray-500 text-sm">{mentorInfo.major}</p>
          <div className="mt-4 text-gray-600 text-sm space-y-1">
            <p>{mentorInfo.email}</p>
            <p>{mentorInfo.phone}</p>
            <p>{mentorInfo.officeHours}</p>
          </div>
          <div className="mt-4 border-t w-full pt-2 text-sm text-gray-400">
            {t("lastUpdated")}: Sep 2025
          </div>
        </Card>

        {/* Right column (main details) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Basic Information */}
          <Card
            className="shadow-sm border-gray-100 mb-5"
            bodyStyle={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800 mb-3">
              {t("basicInformation")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("fullName")}
                </label>
                <Input value={mentorInfo.name} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("email")}
                </label>
                <Input value={mentorInfo.email} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("phone")}
                </label>
                <Input value={mentorInfo.phone} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
<<<<<<< Updated upstream
                  Major
=======
                  {t("faculty")}
>>>>>>> Stashed changes
                </label>
                <Input value={mentorInfo.major} readOnly />
              </div>
            </div>

            <label className="block text-sm text-gray-600 mb-1">{t("bio")}</label>
            <Input.TextArea rows={3} value={mentorInfo.bio} readOnly />
          </Card>

          {/* Expertise & Specialization */}
          <Card
            className="shadow-sm border-gray-100"
            bodyStyle={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800 mb-3">
              {t("expertiseSpecialization")}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              {t("addExpertiseAreas")}
            </p>
            <div className="flex flex-wrap gap-2">
              {mentorInfo.expertise.map((tag, i) => (
                <Tag
                  key={i}
                  color="default"
                  className="px-3 py-1 rounded-full text-gray-700 bg-gray-100 border-none"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>

          {/* Availability & Capacity */}
          <Card
            className="shadow-sm border-gray-100"
            bodyStyle={{ padding: "20px" }}
          >
            <h3 className="font-semibold text-gray-800 mb-3">
              {t("availabilityCapacity")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("officeHours")}
                </label>
                <Input value={mentorInfo.officeHours} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("groupCapacity")}
                </label>
                <Input value={mentorInfo.groupCapacity} readOnly />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
