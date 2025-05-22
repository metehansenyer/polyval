import { validate } from '../src';
import { SimpleValidationSchema } from '../src/types';

describe('validate function', () => {
  // Basic schema definition
  const userSchema: SimpleValidationSchema = {
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

  test('should return no errors for valid data', () => {
    const validData = {
      username: 'testuser',
      email: 'test@example.com',
      age: 25
    };

    const errors = validate(userSchema, validData, { lang: 'en' });
    expect(errors).toEqual([]);
  });

  test('should return errors for invalid data', () => {
    const invalidData = {
      username: 'jo',
      email: 'invalid-email',
      age: 16
    };

    const errors = validate(userSchema, invalidData, { lang: 'en' });
    expect(errors.length).toBe(3);
    expect(errors[0]).toContain('Username');
    expect(errors[0]).toContain('3');
    expect(errors[1]).toContain('Email');
    expect(errors[1]).toContain('Invalid');
    expect(errors[2]).toContain('Age');
    expect(errors[2]).toContain('18');
  });

  test('should return errors in Turkish language', () => {
    const invalidData = {
      username: 'jo',
      email: 'invalid-email',
      age: 16
    };

    const errors = validate(userSchema, invalidData, { lang: 'tr' });
    expect(errors.length).toBe(3);
    expect(errors[0]).toContain('Username');
    expect(errors[0]).toContain('karakter');
    expect(errors[1]).toContain('Email');
    expect(errors[1]).toContain('Geçersiz');
    expect(errors[2]).toContain('Age');
    expect(errors[2]).toContain('En az');
  });

  test('should handle custom messages', () => {
    const invalidData = {
      username: 'jo',
      email: 'invalid-email',
      age: 16
    };

    const errors = validate(userSchema, invalidData, {
      lang: 'en',
      customMessages: {
        string: {
          min: (min) => `Minimum ${min} characters required`,
          email: 'Email format is incorrect'
        },
        number: {
          min: (min) => `Must be at least ${min}`
        }
      }
    });

    expect(errors.length).toBe(3);
    expect(errors[0]).toContain('Minimum 3 characters');
    expect(errors[1]).toContain('Email format is incorrect');
    expect(errors[2]).toContain('Must be at least 18');
  });

  test('should handle field-specific custom messages', () => {
    const invalidData = {
      username: 'jo',
      email: 'invalid-email',
      age: 16
    };

    const errors = validate(userSchema, invalidData, {
      lang: 'en',
      customMessages: {
        fields: {
          username: {
            min: (min) => `Username must be at least ${min} characters long`
          },
          email: {
            email: 'Please enter a valid email address'
          }
        }
      }
    });

    expect(errors.length).toBe(3);
    expect(errors[0]).toContain('Username must be at least 3 characters long');
    expect(errors[1]).toContain('Please enter a valid email address');
  });

  test('should handle custom validators', () => {
    const schemaWithCustomValidator: SimpleValidationSchema = {
      username: {
        type: 'string',
        required: true,
        customValidators: [
          {
            validator: (value) => {
              if (value.toLowerCase() === 'admin') {
                return 'Cannot use admin as username';
              }
              return undefined;
            },
            messageKey: 'noAdminUsername'
          }
        ]
      }
    };

    const invalidData = {
      username: 'admin'
    };

    const errors = validate(schemaWithCustomValidator, invalidData, { lang: 'en' });
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('Cannot use admin');
  });

  test('should handle equals validation', () => {
    const schemaWithEquals: SimpleValidationSchema = {
      password: {
        type: 'string',
        required: true
      },
      confirmPassword: {
        type: 'string',
        required: true,
        equals: 'password'
      }
    };

    const invalidData = {
      password: 'secret123',
      confirmPassword: 'different'
    };

    const errors = validate(schemaWithEquals, invalidData, { lang: 'en' });
    expect(errors.length).toBe(1);
    expect(errors[0].toLowerCase()).toContain('match');
  });

  test('should handle boolean equals validation', () => {
    const schemaWithBooleanEquals: SimpleValidationSchema = {
      acceptTerms: {
        type: 'boolean',
        required: true,
        equals: true
      }
    };

    const invalidData = {
      acceptTerms: false
    };

    const errors = validate(schemaWithBooleanEquals, invalidData, { lang: 'en' });
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('AcceptTerms');
  });
});
