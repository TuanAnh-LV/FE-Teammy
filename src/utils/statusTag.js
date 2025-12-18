export const STATUS_TAG_STYLES = {
  open: {
    base: "bg-green-100 text-green-700",
    border: "border border-green-200",
  },
  closed: {
    base: "bg-gray-100 text-gray-700",
    border: "border border-gray-200",
  },
};

export const getStatusTagClasses = (status, options = {}) => {
  const {
    withBorder = false,
    fallback = "bg-gray-100 text-gray-700",
    fallbackBorder = "border border-gray-200",
  } = options;

  const normalized = String(status || "").toLowerCase();
  const style = STATUS_TAG_STYLES[normalized];

  if (!style) {
    return withBorder ? `${fallback} ${fallbackBorder}` : fallback;
  }

  return withBorder ? `${style.base} ${style.border}` : style.base;
};

export const getStatusLabel = (status, t) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "open") {
    return (typeof t === "function" && t("open")) || "Open";
  }

  if (normalized === "closed") {
    return (typeof t === "function" && t("closed")) || "Closed";
  }

  return (typeof t === "function" && t("closed")) || "Closed";
};
