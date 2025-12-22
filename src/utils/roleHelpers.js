/**
 * Role và Position helpers
 */

export const ALL_ROLES = ["frontend", "backend", "mobile", "devops", "qa"];

export const ROLE_COLORS = {
  frontend: "blue",
  backend: "green",
  mobile: "purple",
  devops: "orange",
  qa: "red",
};

export const ROLE_BUTTON_STYLES = {
  frontend: "bg-blue-600 text-white",
  backend: "bg-green-600 text-white",
  mobile: "bg-purple-600 text-white",
  devops: "bg-orange-600 text-white",
  qa: "bg-red-600 text-white",
  all: "bg-gray-800 text-white",
};

/**
 * Suy luận primary role từ tên position
 */
export function inferPrimaryRoleFromPositionName(name = "") {
  const n = String(name).toLowerCase();

  if (n.includes("frontend") || n.includes("front end") || n.includes("fe"))
    return "frontend";
  if (n.includes("backend") || n.includes("back end") || n.includes("be"))
    return "backend";
  if (n.includes("mobile")) return "mobile";
  if (n.includes("devops")) return "devops";
  if (n.includes("qa") || n.includes("tester")) return "qa";

  // rộng -> không lock
  if (n.includes("fullstack") || n.includes("full stack")) return "all";
  if (n.includes("data")) return "all";
  if (n.includes("business analyst") || n === "ba" || n.includes(" ba "))
    return "all";

  return "all";
}

/**
 * Gợi ý secondary role mặc định dựa trên primary role
 */
export function defaultSecondaryRoles(primaryRole) {
  switch (primaryRole) {
    case "frontend":
      return ["mobile"]; // FE hay đụng RN/Flutter
    case "mobile":
      return ["frontend"];
    case "backend":
      return ["devops"];
    case "devops":
      return ["backend"];
    default:
      return [];
  }
}

/**
 * Normalize skill tokens từ array hoặc object
 */
export function normalizeSkillTokens(skills) {
  return Array.isArray(skills)
    ? skills.map((s) => (typeof s === "string" ? s : s?.token)).filter(Boolean)
    : [];
}

/**
 * Get unique values from array
 */
export function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

/**
 * Đếm số skills đã chọn theo role
 */
export function countSkillsByRole(selectedSkills, availableSkills) {
  const counts = {};
  const skillMap = new Map(availableSkills.map((s) => [s.token, s]));

  for (const role of ALL_ROLES) {
    counts[role] = 0;
  }

  for (const token of selectedSkills) {
    const skill = skillMap.get(token);
    if (skill?.role && counts[skill.role] !== undefined) {
      counts[skill.role]++;
    }
  }

  return counts;
}
