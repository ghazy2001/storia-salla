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

  // ALWAYS use Vercel URL when NOT on Vercel's own domain AND NOT on localhost
  // This ensures Salla integration works correctly while local development stays local
  const hostname = window.location.hostname;
  const isOnVercel = hostname.includes("vercel.app");
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const vercelBase = "https://storia-salla.vercel.app/";

  // Clean the path
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If not on Vercel's domain AND not local, use absolute Vercel URLs
  if (!isOnVercel && !isLocal) {
    const resolvedUrl = `${vercelBase}${cleanPath}`;
    return resolvedUrl;
  }

  // On Vercel itself, use relative paths
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Get image source - handles both external URLs (from Salla API) and local assets
 * This prevents double-resolution of CDN URLs that are already full paths
 * @param {string} src - The image source (URL or local path)
 * @returns {string} - The resolved image source
 */
export const getImageSrc = (src) => {
  if (!src) return "";
  // If it's already a full URL (from Salla API or external), return as-is
  if (src.startsWith("http") || src.startsWith("//")) {
    return src;
  }
  // Otherwise, resolve as a local asset
  return resolveAsset(src);
};
