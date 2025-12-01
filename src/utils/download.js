// utils/download.js
export function downloadBlob(data, fallbackName = "TeammyUsersTemplate.xlsx", disposition) {
  let filename = fallbackName;
  if (disposition) {
    // Parse filename from Content-Disposition header
    // Support both UTF-8 encoded (filename*=UTF-8''...) and simple (filename="...")
    
    // Try UTF-8 encoded filename first (RFC 5987)
    const utf8Match = /filename\*=UTF-8''([^;,\n]+)/i.exec(disposition);
    if (utf8Match && utf8Match[1]) {
      try {
        filename = decodeURIComponent(utf8Match[1].trim());
      } catch (e) {
        console.warn('Failed to decode UTF-8 filename:', e);
      }
    } else {
      // Fall back to regular filename
      const regularMatch = /filename=["']?([^"';,\n]+)["']?/i.exec(disposition);
      if (regularMatch && regularMatch[1]) {
        filename = regularMatch[1].trim();
        // Try to decode if it looks URL-encoded
        try {
          const decoded = decodeURIComponent(filename);
          if (decoded !== filename) filename = decoded;
        } catch (e) {
          // Keep original if decode fails
        }
      }
    }
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
