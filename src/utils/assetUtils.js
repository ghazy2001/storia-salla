/**
 * Resolves an asset path by prepending the base URL.
 * Works for both development and production (e.g. GitHub Pages subpaths).
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

  const base = import.meta.env.BASE_URL || "/";
  // Ensure we don't have double slashes
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${cleanBase}${cleanPath}`;
};
