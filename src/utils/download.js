// utils/download.js
export function downloadBlob(data, fallbackName = "TeammyUsersTemplate.xlsx", disposition) {
  let filename = fallbackName;
  if (disposition) {
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(disposition);
    const raw = decodeURIComponent(m?.[1] || m?.[2] || "");
    if (raw) filename = raw;
  }
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
