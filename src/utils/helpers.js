// src/utils/helpers.js

/** Mồi cho nhiều shape response khác nhau của axios */
export function toArraySafe(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.result)) return res.result;
  return [];
}

/** Hiển thị "x minutes ago" từ ISO string */
export function timeAgoFrom(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const m = Math.floor(diffSec / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  const mon = Math.floor(day / 30);
  const yr = Math.floor(day / 365);

  if (yr)  return `${yr} year${yr > 1 ? "s" : ""} ago`;
  if (mon) return `${mon} month${mon > 1 ? "s" : ""} ago`;
  if (day) return `${day} day${day > 1 ? "s" : ""} ago`;
  if (h)   return `${h} hour${h > 1 ? "s" : ""} ago`;
  if (m)   return `${m} minute${m > 1 ? "s" : ""} ago`;
  return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
}

/** positions từ API có thể là snake/camel hoặc CSV -> mảng */
export function toArrayPositions(obj) {
  const raw = obj?.position_needed ?? obj?.positionNeeded ?? "";
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Lấy 2 chữ cái đầu tên (avatar text) */
export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .map((x) => x?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Deterministic avatar URL based on email (DiceBear fallback) */
export function avatarFromEmail(email = "", size = 96) {
  const trimmed = (email || "teammy").trim();
  const nameSeed = trimmed ? trimmed.split("@")[0] || trimmed : "teammy";
  const encodedName = encodeURIComponent(nameSeed.replace(/[^a-zA-Z0-9 ]+/g, " ").trim() || "User");

  const palettes = ["4F46E5", "0EA5E9", "EC4899", "F97316", "10B981", "8B5CF6"];
  const hash = [...trimmed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const background = palettes[hash % palettes.length];

  const normalizedSize = Math.max(32, Math.min(Number(size) || 96, 512));
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${normalizedSize}&background=${background}&color=ffffff&bold=true`;
}
