/** URL de base de l'API */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV
    ? ''
    : 'https://patrimoine-030o.onrender.com');

export const resolveApiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalized;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${normalized}`;
};