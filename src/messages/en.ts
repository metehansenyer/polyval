export const enMessages = {
  required: "This field is required",
  invalid_type: "Invalid type",
  
  // String validators
  string: {
    min: (min: number) => `Must be at least ${min} characters long`,
    max: (max: number) => `Must not exceed ${max} characters`,
    length: (len: number) => `Must be exactly ${len} characters long`,
    email: "Invalid email address",
    url: "Invalid URL",
    uuid: "Invalid UUID",
    cuid: "Invalid CUID",
    datetime: "Invalid datetime format",
    ip: "Invalid IP address",
    regex: "Invalid format",
    startsWith: (value: string) => `Must start with "${value}"`,
    endsWith: (value: string) => `Must end with "${value}"`,
    numeric: "Must contain only numeric characters"
  },
  
  // Number validators
  number: {
    min: (min: number) => `Must be at least ${min}`,
    max: (max: number) => `Must not exceed ${max}`
  },
  
  // Date validators
  date: {
    min: (date: Date) => `Must be after ${date.toLocaleDateString()}`,
    max: (date: Date) => `Must be before ${date.toLocaleDateString()}`
  },
  
  // Boolean validators
  boolean: {
    true: "Must be checked",
    false: "Must be unchecked"
  },
  
  // Relation validators
  equals: (field: string) => `Must match the ${field} field`,
  notEquals: (field: string) => `Must not match the ${field} field`
};
