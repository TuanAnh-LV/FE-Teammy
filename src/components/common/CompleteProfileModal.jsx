import React, { useState, useEffect } from "react";
import { AlertCircle, LogOut, Plus, X } from "lucide-react";
import { notification, Tag, Badge } from "antd";
import { UserService } from "../../services/user.service";
import { MajorService } from "../../services/major.service";
import { SkillService } from "../../services/skill.service";
import { useAuth } from "../../context/AuthContext";

const CompleteProfileModal = ({ isOpen, profileData, onComplete }) => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    gender: "",
    majorId: "",
    skills: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("all"); // all, frontend, backend, mobile, devops, qa
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        majorId: profileData.majorId || "",
        skills: profileData.skills || [],
      });
      setSelectedSkills(profileData.skills || []);
    }
  }, [profileData]);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await MajorService.getMajors();
        if (response?.data) {
          setMajors(response.data);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };
    if (isOpen) {
      fetchMajors();
    }
  }, [isOpen]);

  // Fetch skills when major changes
  useEffect(() => {
    const fetchSkills = async () => {
      if (!formData.majorId) {
        setAvailableSkills([]);
        return;
      }

      try {
        // Find the major name from majorId
        const selectedMajor = majors.find(
          (major) => major.majorId === formData.majorId
        );

        if (!selectedMajor) {
          setAvailableSkills([]);
          return;
        }

        console.log("Selected Major Name:", selectedMajor.majorName);

        const response = await SkillService.list({
          major: selectedMajor.majorName,
        });

        if (response?.data) {
          setAvailableSkills(response.data);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [formData.majorId, majors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear skills when major changes
    if (name === "majorId") {
      setFormData((prev) => ({
        ...prev,
        majorId: value,
        skills: [],
      }));
      setSelectedSkills([]);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddSkill = (skillToken) => {
    if (!selectedSkills.includes(skillToken)) {
      const newSkills = [...selectedSkills, skillToken];
      setSelectedSkills(newSkills);
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));

      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: "" }));
      }
    }
  };

  const handleRemoveSkill = (skillToken) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToken);
    setSelectedSkills(newSkills);
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  const filteredSkills = availableSkills.filter((skill) => {
    if (skillFilter === "all") return true;
    return skill.role === skillFilter;
  });

  const getRoleColor = (role) => {
    const colors = {
      frontend: "blue",
      backend: "green",
      mobile: "purple",
      devops: "orange",
      qa: "red",
    };
    return colors[role] || "default";
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate fields that are shown (i.e., empty in profileData)
    if (!profileData?.displayName && !formData.displayName?.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!profileData?.phone && !formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!profileData?.gender && !formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!profileData?.majorId && !formData.majorId) {
      newErrors.majorId = "Major is required";
    }

    // Skills is always required to mark profile as complete
    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = "Skills are required to complete your profile";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notification.error({
        message: "Validation Error",
        description: "Please fill in all required fields",
        placement: "topRight",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add skillsCompleted: true to mark profile as complete
      const payload = {
        ...formData,
        skillsCompleted: true,
      };

      const response = await UserService.updateMyProfile(payload);
      if (response?.data) {
        notification.success({
          message: "Success",
          description: "Profile completed successfully!",
          placement: "topRight",
        });
        onComplete(response.data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notification.error({
        message: "Error",
        description: "Failed to update profile. Please try again.",
        placement: "topRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    notification.info({
      message: "Logged Out",
      description: "You have been logged out successfully.",
      placement: "topRight",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header with Warning */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
          <p className="text-white/90">
            Please complete all required information to access all features of
            the platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Display Name - Only show if empty */}
          {!profileData?.displayName && (
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.displayName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="Enter your display name"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>
          )}

          {/* Phone - Only show if empty */}
          {!profileData?.phone && (
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Gender - Only show if empty */}
          {!profileData?.gender && (
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>
          )}

          {/* Major - Only show if empty */}
          {!profileData?.majorId && (
            <div>
              <label
                htmlFor="majorId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Major <span className="text-red-500">*</span>
              </label>
              <select
                id="majorId"
                name="majorId"
                value={formData.majorId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.majorId ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
              >
                <option value="">Select major</option>
                {majors.map((major) => (
                  <option key={major.majorId} value={major.majorId}>
                    {major.majorName}
                  </option>
                ))}
              </select>
              {errors.majorId && (
                <p className="text-red-500 text-sm mt-1">{errors.majorId}</p>
              )}
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills <span className="text-red-500">*</span>
            </label>

            {!formData.majorId ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Please select a major first to choose skills
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Skills */}
                <div className="min-h-[100px] p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your Selected Skills ({selectedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.length === 0 ? (
                      <p className="text-gray-400 text-sm">
                        Click skills below to add them here
                      </p>
                    ) : (
                      selectedSkills.map((skillToken) => {
                        const skill = availableSkills.find(
                          (s) => s.token === skillToken
                        );
                        return (
                          <Tag
                            key={skillToken}
                            color={getRoleColor(skill?.role)}
                            closable
                            onClose={() => handleRemoveSkill(skillToken)}
                            className="cursor-pointer"
                          >
                            {skillToken}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Role Filter */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSkillFilter("all")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      skillFilter === "all"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All ({availableSkills.length})
                  </button>
                  {["frontend", "backend", "mobile", "devops", "qa"].map(
                    (role) => {
                      const count = availableSkills.filter(
                        (s) => s.role === role
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSkillFilter(role)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition capitalize ${
                            skillFilter === role
                              ? `bg-${getRoleColor(role)}-600 text-white`
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {role} ({count})
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Available Skills */}
                <div className="max-h-[250px] overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Available Skills (Click to add)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.token);
                      return (
                        <Tag
                          key={skill.token}
                          color={
                            isSelected ? "default" : getRoleColor(skill.role)
                          }
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            !isSelected && handleAddSkill(skill.token)
                          }
                        >
                          {skill.token}
                          {!isSelected && (
                            <Plus className="inline-block w-3 h-3 ml-1" />
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.majorId
                ? "Click on skills to add them to your profile"
                : "This field is required to complete your profile"}
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Notice:</p>
                <p>
                  You must complete all required fields including your skills to
                  access all features of the platform. This is a one-time setup.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
            >
              {isSubmitting ? "Completing Profile..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
