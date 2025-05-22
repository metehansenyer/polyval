/**
 * Format field name properly
 * @param fieldName Field name
 * @returns Formatted field name
 */
export function formatFieldName(fieldName: string): string {
  if (!fieldName) return '';
  
  // Make first letter uppercase, rest lowercase
  const firstChar = fieldName.charAt(0).toUpperCase();
  const rest = fieldName.slice(1);
  
  // Split camelCase words (e.g., 'firstName' -> 'First Name')
  const formattedRest = rest.replace(/([A-Z])/g, ' $1').toLowerCase();
  
  return firstChar + formattedRest;
}

/**
 * Check the type of a variable
 * @param value Value to check
 * @returns Type information
 */
export function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Simplify an object by showing only first-level values
 * @param obj Object to simplify
 * @returns Simplified object representation
 */
export function simplifyObject(obj: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      result[key] = 'null';
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        result[key] = `Array(${value.length})`;
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = `{...}`;
      }
    } else {
      result[key] = String(value);
    }
  }
  
  return result;
} 