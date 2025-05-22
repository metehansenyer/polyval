/**
 * PolyVal Usage Example
 * 
 * This example demonstrates the basic usage of the PolyVal validation library.
 * It showcases a user registration form validation scenario with various validation rules.
 */

import { validate, SimpleValidationSchema } from 'polyval';

// Define a validation schema for user registration
const userRegistrationSchema: SimpleValidationSchema = {
  username: {
    type: 'string',
    required: true,
    min: 3,
    max: 20,
    regex: '^[a-zA-Z0-9_]+$', // Only alphanumeric characters and underscore
    customValidators: [
      {
        // Prevent usage of 'admin' as username
        validator: (value: string) => {
          return value.toLowerCase() === 'admin' 
            ? 'Username admin is reserved' 
            : undefined;
        },
        messageKey: 'noAdminUsername'
      }
    ]
  },
  email: {
    type: 'string',
    required: true,
    email: true // Email format validation
  },
  password: {
    type: 'string',
    required: true,
    min: 8,
    // Password must contain at least one uppercase letter, one lowercase letter, one number and one special character
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'
  },
  confirmPassword: {
    type: 'string',
    required: true,
    equals: 'password' // Must match the password field
  },
  age: {
    type: 'number',
    min: 18 // Minimum age requirement
  },
  acceptTerms: {
    type: 'boolean',
    required: true,
    equals: true // Terms must be accepted
  }
};

// Invalid example data
const invalidData = {
  username: 'a',
  email: 'invalid-email',
  password: 'weak',
  confirmPassword: 'different',
  age: 16,
  acceptTerms: false
};

console.log('=== TURKISH ERROR MESSAGES ===');
const errorsTR = validate(userRegistrationSchema, invalidData, { lang: 'tr' });
errorsTR.forEach((error: string) => console.log(`- ${error}`));

// Custom English error messages
const customMessages = {
  required: "This field cannot be empty",
  
  string: {
    min: (min: number) => `At least ${min} characters required`,
    max: (max: number) => `Cannot exceed ${max} characters`,
    email: "Please enter a valid email address",
    regex: "Contains invalid characters"
  },
  
  number: {
    min: (min: number) => `Must be at least ${min} years old`
  },
  
  // Field-specific custom messages
  fields: {
    username: {
      min: (min: number) => `Username must have at least ${min} characters`,
      noAdminUsername: "Sorry, 'admin' is a reserved username"
    },
    password: {
      min: (min: number) => `Password must be at least ${min} characters long`,
      regex: "Password must include uppercase, lowercase, number and special character"
    },
    confirmPassword: {
      equals: "Passwords do not match"
    },
    acceptTerms: {
      equals: "You must accept the terms and conditions"
    }
  }
};

console.log('\n=== CUSTOM ENGLISH ERROR MESSAGES ===');
const errorsEN = validate(userRegistrationSchema, invalidData, { 
  lang: 'en',
  customMessages
});
errorsEN.forEach((error: string) => console.log(`- ${error}`));

// Valid example data
const validData = {
  username: 'johndoe',
  email: 'john.doe@example.com',
  password: 'Secure1@Password',
  confirmPassword: 'Secure1@Password',
  age: 25,
  acceptTerms: true
};

console.log('\n=== VALID DATA VALIDATION ===');
const noErrors = validate(userRegistrationSchema, validData, { lang: 'en' });
if (noErrors.length === 0) {
  console.log('✓ Data validation successful, no errors!');
} else {
  console.log('Unexpected errors:', noErrors);
} 