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

  // ALWAYS use Vercel URL when NOT on Vercel's own domain
  // This ensures Salla integration works correctly
  const isOnVercel = window.location.hostname.includes("vercel.app");
  const vercelBase = "https://storia-salla.vercel.app/";

  // Clean the path
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If not on Vercel's domain, always use absolute Vercel URLs
  if (!isOnVercel) {
    const resolvedUrl = `${vercelBase}${cleanPath}`;
    // Logging disabled to keep console clean
    // console.log("[Storia Asset]", path, "->", resolvedUrl);
    return resolvedUrl;
  }

  // On Vercel itself, use relative paths
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};
