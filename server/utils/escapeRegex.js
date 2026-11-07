/**
 * Escapes special regular expression characters in a string to prevent ReDoS or syntax crashes.
 * @param {string} str - Raw input string
 * @returns {string} - Escaped string safe for RegExp
 */
export const escapeRegex = (str = '') => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
