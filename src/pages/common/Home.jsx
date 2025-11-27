import React, { useState, useEffect } from "react";
import HeroSection from "../../components/common/HeroSection";
import FeaturesSection from "../../components/common/FeaturesSection";
import CompleteProfileModal from "../../components/common/CompleteProfileModal";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { userInfo, setUserInfo } = useAuth();
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  useEffect(() => {
    // Check if user is logged in and skillsCompleted is false
    if (userInfo && userInfo.skillsCompleted === false) {
      setShowCompleteProfile(true);
    }
  }, [userInfo]);

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
