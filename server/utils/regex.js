/**
 * Escapes special characters for use in regular expressions to prevent ReDoS
 * and unwanted pattern evaluation in MongoDB regex queries.
 *
 * @param {string} str - Raw input query string
 * @param {number} [maxLength=100] - Maximum allowed length
 * @returns {string} - Escaped and trimmed query string safe for RegExp
 */
export const escapeRegex = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim().slice(0, maxLength);
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
