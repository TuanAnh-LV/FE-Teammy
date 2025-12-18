import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UserService } from "../../services/user.service";
import { MajorService } from "../../services/major.service";
import { toast } from "react-toastify";
import { useTranslation } from "../../hook/useTranslation";

const EditProfileModal = ({ isOpen, onClose, profileData, onUpdate }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    gender: "",
    majorId: "",
    skills: "",
    skillsCompleted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        majorId: profileData.majorId || "",
        // Convert skills array from API to comma-separated string for textarea
        skills: Array.isArray(profileData.skills)
          ? profileData.skills.join(", ")
          : profileData.skills || "",
        skillsCompleted: profileData.skillsCompleted || false,
      });
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

      }
    };
    if (isOpen) {
      fetchMajors();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Normalize skills from textarea (string) to array for API
      const skillsArray = (formData.skills || "")
        .split(/[,\\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: skillsArray,
      };

      const response = await UserService.updateMyProfile(payload);
      if (response?.data) {
        toast.success(
          t("profileUpdatedSuccess") || "Profile updated successfully!"
        );
        onUpdate(response.data);
        onClose();
      }
    } catch (error) {
      toast.error(
        t("updateProfileFailed") ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{t("editProfile") || "Edit Profile"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("displayName") || "Display Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder={t("enterDisplayName") || "Enter your display name"}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("phoneNumber") || "Phone Number"}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder={t("enterPhoneNumber") || "Enter your phone number"}
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("gender") || "Gender"}
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">{t("selectGender") || "Select gender"}</option>
              <option value="Nam">{t("male") || "Male"}</option>
              <option value="Nữ">{t("female") || "Female"}</option>
              <option value="Khác">{t("other") || "Other"}</option>
            </select>
          </div>

          {/* Major */}
          <div>
            <label
              htmlFor="majorId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("major") || "Major"}
            </label>
            <select
              id="majorId"
              name="majorId"
              value={formData.majorId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">{t("selectMajor") || "Select major"}</option>
              {majors.map((major) => (
                <option key={major.majorId} value={major.majorId}>
                  {major.majorName}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("skills") || "Skills"}
            </label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder={t("enterSkills") || "Enter your skills"}
            />
          </div>

          {/* Skills Completed Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skillsCompleted"
              name="skillsCompleted"
              checked={formData.skillsCompleted}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="skillsCompleted"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              {t("markSkillsCompleted") || "Mark skills section as completed"}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (t("saving") || "Saving...") : (t("saveChanges") || "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

