/**
 * Resolves an asset path by prepending the base URL.
 * When running on storiasa.com (Salla integration), uses absolute Vercel URL.
 * Otherwise uses relative paths for local development and Vercel deployment.
 * @param {string} path - The path to the asset (e.g. 'assets/logo.png')
 * @returns {string} - The resolved absolute path
 */
export const resolveAsset = (path) => {
  if (!path) return "";

  // If it's already an external URL or a data/blob URL, return it as is
  if (
    path.startsWith("http") ||
    path.startsWith("//") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path;

  // Detect if we're running on Salla (embedded via integration script)
  const isOnSalla =
    window.location.hostname.includes("storiasa.com") ||
    window.location.hostname.includes("salla.");

  // If on Salla, use absolute Vercel URL for all assets
  if (isOnSalla) {
    const vercelBase = "https://storia-salla.vercel.app/";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${vercelBase}${cleanPath}`;
  }

  // Otherwise, use relative path (for Vercel deployment and local dev)
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${cleanBase}${cleanPath}`;
};
