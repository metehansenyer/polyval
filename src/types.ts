export interface SimpleValidationSchema {
  [fieldName: string]: {
    type: 'string' | 'number' | 'boolean' | 'date'; // Supported basic types
    required?: boolean;
    // Keys corresponding to basic Zod rules:
    min?: number;     // string length, number value, date min
    max?: number;     // string length, number value, date max
    length?: number;  // exact string length
    email?: boolean;  // string email format
    url?: boolean;    // string URL format
    uuid?: boolean;   // string UUID format
    cuid?: boolean;   // string CUID format
    datetime?: boolean; // string ISO 8601 datetime format
    ip?: 'v4' | 'v6'; // string IP address format
    regex?: string;   // string regex pattern (provided as string instead of RegExp object)
    startsWith?: string; // string startsWith
    endsWith?: string;   // string endsWith
    numeric?: boolean;   // string only numeric characters

    // Field Comparison Rules:
    equals?: string | boolean; // For equality with another field (e.g. must be equal to 'password' field) or direct value for boolean
    notEquals?: string; // For inequality with another field

    // Custom Validators (Field-Based)
    customValidators?: Array<{
      validator: (value: any, data: Record<string, any>) => string | undefined;
      messageKey?: string; // Optional: key to reference this validator in customMessages object
    }>;
  };
}

export interface CustomMessages {
  // General error messages (corresponding to default Zod errors)
  required?: string;
  invalid_type?: string;
  // ... for other general Zod error codes

  // Messages specific to basic library validators (can take parameters)
  string?: {
    email?: string;
    min?: (min: number) => string;
    max?: (max: number) => string;
    length?: (len: number) => string;
    url?: string;
    uuid?: string;
    cuid?: string;
    datetime?: string;
    ip?: string;
    regex?: string;
    startsWith?: (value: string) => string;
    endsWith?: (value: string) => string;
    numeric?: string;
  };
  number?: {
    min?: (min: number) => string;
    max?: (max: number) => string;
  };
  date?: {
    min?: (date: Date) => string;
    max?: (date: Date) => string;
  };

  // Messages specific to field comparison rules
  equals?: (field: string) => string;
  notEquals?: (field: string) => string;

  // Field-based messages (with field name in simple schema)
  fields?: {
    [fieldName: string]: {
      // Custom messages for the field's own rules
      min?: (min: number) => string;
      max?: (max: number) => string;
      required?: string;
      email?: string;
      // Index definition for all other possible custom messages
      [customMessageKey: string]: any;
    };
  };
  
  // Global Custom Validator Messages
  custom?: {
    [messageKey: string]: string | ((value: any, data: Record<string, any>) => string);
  };
}

export interface ValidationOptions {
  lang: string;
  customMessages?: CustomMessages;
}

export interface ValidationIssue {
  path: string[];
  code: string;
  message?: string;
  params?: Record<string, any>;
}
