# PolyVal

PolyVal is a multilingual and highly customizable validation library. It uses Zod as a backend while providing developers with a simplified API.

## Features

- **Simplified API**: Use without needing complex type definitions or knowledge of validation rules
- **Multilingual Support**: Default support for `en` (English) and `tr` (Turkish)
- **Fully Customizable Error Messages**: Customize error messages by field, rule type, or globally
- **Custom Validation Rules**: Easily define your own validation rules
- **TypeScript Support**: Full TypeScript support with type safety

## Installation

```bash
npm install polyval
```

## Basic Usage

```typescript
import { validate } from 'polyval';

// Simple schema definition
const userSchema = {
  username: {
    type: 'string',
    required: true,
    min: 3,
    max: 20
  },
  email: {
    type: 'string',
    required: true,
    email: true
  },
  age: {
    type: 'number',
    min: 18
  }
};

// Data to validate
const userData = {
  username: 'jo',
  email: 'invalid-email',
  age: 16
};

// Validation (using Turkish language)
const errors = validate(userSchema, userData, { lang: 'tr' });
console.log(errors);
// [
//   "Username: En az 3 karakter uzunluğunda olmalıdır",
//   "Email: Geçersiz e-posta adresi",
//   "Age: En az 18 olmalıdır"
// ]
```

## Schema Definition

PolyVal schemas are defined using simple JavaScript objects. Each field uses a configuration object:

```typescript
const schema = {
  fieldName: {
    type: 'string' | 'number' | 'boolean' | 'date',  // Field type (required)
    required: boolean,                               // Is field required? (default: false)
    // Other validation rules...
  }
};
```

### Supported Validation Rules

#### For String Fields

```typescript
{
  type: 'string',
  required: boolean,           // Is required?
  min: number,                 // Minimum length
  max: number,                 // Maximum length
  length: number,              // Exact length
  email: boolean,              // Email format
  url: boolean,                // URL format
  uuid: boolean,               // UUID format
  cuid: boolean,               // CUID format
  datetime: boolean,           // ISO 8601 datetime format
  ip: 'v4' | 'v6',             // IP address format
  regex: string,               // Regex pattern (as string)
  startsWith: string,          // Must start with this value
  endsWith: string,            // Must end with this value
  numeric: boolean             // Only numeric characters
}
```

#### For Number Fields

```typescript
{
  type: 'number',
  required: boolean,           // Is required?
  min: number,                 // Minimum value
  max: number                  // Maximum value
}
```

#### For Date Fields

```typescript
{
  type: 'date',
  required: boolean,           // Is required?
  min: number,                 // Minimum date (timestamp)
  max: number                  // Maximum date (timestamp)
}
```

#### For Boolean Fields

```typescript
{
  type: 'boolean',
  required: boolean,           // Is required?
  equals: boolean              // Expected to be a specific value (true/false)?
}
```

### Field Comparison Rules

To validate a field in relation to another field:

```typescript
{
  password: {
    type: 'string',
    required: true,
    min: 8
  },
  confirmPassword: {
    type: 'string',
    required: true,
    equals: 'password'         // Must match the 'password' field
  },
  oldPassword: {
    type: 'string',
    required: true,
    notEquals: 'password'      // Must not match the 'password' field
  }
}
```

### Custom Validation Rules

To define your own validation logic:

```typescript
{
  username: {
    type: 'string',
    required: true,
    customValidators: [
      {
        validator: (value, data) => {
          // Custom validation logic
          if (value.toLowerCase() === 'admin') {
            return 'This username is not available'; // Return error message
          }
          return undefined; // Return undefined for successful validation
        },
        messageKey: 'noAdminUsername'  // Key to use for custom messages
      }
    ]
  }
}
```

## Customizing Error Messages

PolyVal allows you to fully customize error messages:

```typescript
const errors = validate(schema, data, {
  lang: 'en',
  customMessages: {
    // 1. General error messages
    required: 'This field cannot be empty',
    invalid_type: 'Invalid value type',
    
    // 2. Type-based error messages
    string: {
      min: (min) => `Please enter at least ${min} characters`,
      email: 'Please enter a valid email address'
    },
    number: {
      min: (min) => `Value must be at least ${min}`
    },
    
    // 3. Custom comparison rule messages
    equals: (field) => `This field must match the ${field} field`,
    
    // 4. Field-based custom messages (highest priority)
    fields: {
      username: {
        min: (min) => `Username must be at least ${min} characters`,
        required: 'Username is required',
        // Message for custom validation rule
        noAdminUsername: 'Admin username is reserved'
      }
    },
    
    // 5. Global custom validator messages
    custom: {
      noAdminUsername: 'Admin username cannot be used'
    }
  }
});
```

### Message Priority Order

Error messages are determined according to the following priority order (from highest to lowest):

1. Field-based custom validator messages (`customMessages.fields['fieldName']['customMessageKey']`)
2. Other field-based custom messages (`customMessages.fields['fieldName']['min']`)
3. Global custom validator messages (`customMessages.custom['messageKey']`)
4. General rule-based custom messages (`customMessages.string.email`, `customMessages.number.min`)
5. General error type messages (`customMessages.required`, `customMessages.invalid_type`)
6. Default messages in the selected language

## Comprehensive Examples

### User Registration Validation Example

```typescript
import { validate } from 'polyval';

// User registration schema
const userRegistrationSchema = {
  username: {
    type: 'string',
    required: true,
    min: 3,
    max: 20,
    regex: '^[a-zA-Z0-9]+$', // Only alphanumeric characters
    customValidators: [{
      validator: (value) => value.toLowerCase() !== 'admin' ? undefined : 'Admin username is not available',
      messageKey: 'noAdminUsername'
    }]
  },
  email: {
    type: 'string',
    required: true,
    email: true
  },
  age: {
    type: 'number',
    min: 18,
    required: false
  },
  password: {
    type: 'string',
    required: true,
    min: 8,
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$' // Strong password
  },
  confirmPassword: {
    type: 'string',
    required: true,
    equals: 'password', // Must match the 'password' field
    customValidators: [{
      validator: (value, data) => value !== data.password + '123' ? undefined : 'You used a predictable password',
      messageKey: 'predictablePassword'
    }]
  },
  acceptTerms: {
    type: 'boolean',
    required: true,
    equals: true // User must accept terms
  }
};

// Invalid data
const userData = {
  username: "al",
  email: "invalid-email",
  password: "123",
  confirmPassword: "456",
  acceptTerms: false
};

// Validate with Turkish error messages
const errorsTR = validate(userRegistrationSchema, userData, { lang: 'tr' });
console.log(errorsTR);

// Validate with English and customized messages
const errorsEN = validate(userRegistrationSchema, userData, {
  lang: 'en',
  customMessages: {
    string: {
      min: (min) => `Please ensure this field has at least ${min} characters.`,
      email: "That doesn't look like a valid email address."
    },
    fields: {
      username: {
        noAdminUsername: "Sorry, 'admin' is a reserved username."
      },
      confirmPassword: {
        equals: "Passwords must match exactly."
      }
    }
  }
});

console.log(errorsEN);
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/polyval.git
cd polyval
npm install
```

### Test

```bash
npm test
```

### Build

```bash
npm run build
```

## Example Usage

There is an example project in the `example` directory that demonstrates how to use the library. To explore and run this example:

1. Install and build the main PolyVal project:
```bash
npm install
npm run build
```

2. Navigate to the example project and run it:
```bash
cd example
npm install
npm run dev
```

This example demonstrates user registration validation, multilingual error messages, and how to use customized messages.

## License

MIT 