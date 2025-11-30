import React, { useState, useEffect } from "react";
import HeroSection from "../../components/common/HeroSection";
import FeaturesSection from "../../components/common/FeaturesSection";
import CompleteProfileModal from "../../components/common/CompleteProfileModal";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { userInfo, setUserInfo, role } = useAuth();
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  useEffect(() => {
    // Check if user needs to complete profile
    // Admin, Moderator, Mentor don't need to complete profile
    const roleNormalized = role?.toLowerCase();
    const isStaffRole = ["admin", "moderator", "mentor"].includes(
      roleNormalized
    );

    // Only show modal for non-staff roles who haven't completed their profile
    if (userInfo && userInfo.skillsCompleted === false && !isStaffRole) {
      setShowCompleteProfile(true);
    }
  }, [userInfo, role]);

  const handleProfileComplete = (updatedProfile) => {
    // Update userInfo in context
    setUserInfo({
      ...userInfo,
      ...updatedProfile,
      skillsCompleted: true,
    });
    setShowCompleteProfile(false);
  };

  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />

      <CompleteProfileModal
        isOpen={showCompleteProfile}
        profileData={userInfo}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};

export default Home;
