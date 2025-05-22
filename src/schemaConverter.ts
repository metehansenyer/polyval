import * as z from 'zod';
import { SimpleValidationSchema } from './types';

/**
 * Converts SimpleValidationSchema to a Zod schema
 * @param simpleSchema Simple validation schema
 * @returns Zod schema
 */
export function buildZodSchema(simpleSchema: SimpleValidationSchema): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  // Process each field
  for (const [fieldName, fieldConfig] of Object.entries(simpleSchema)) {
    let fieldSchema: z.ZodTypeAny;

    // Determine the base type
    switch (fieldConfig.type) {
      case 'string':
        fieldSchema = z.string();
        
        // String validations
        // Email validation
        if (fieldConfig.email) {
          fieldSchema = (fieldSchema as z.ZodString).email();
        }

        // Min length
        if (typeof fieldConfig.min === 'number') {
          fieldSchema = (fieldSchema as z.ZodString).min(fieldConfig.min);
        }

        // Max length
        if (typeof fieldConfig.max === 'number') {
          fieldSchema = (fieldSchema as z.ZodString).max(fieldConfig.max);
        }

        // Exact length
        if (typeof fieldConfig.length === 'number') {
          fieldSchema = (fieldSchema as z.ZodString).length(fieldConfig.length);
        }

        // URL format
        if (fieldConfig.url) {
          fieldSchema = (fieldSchema as z.ZodString).url();
        }

        // UUID format
        if (fieldConfig.uuid) {
          fieldSchema = (fieldSchema as z.ZodString).uuid();
        }

        // CUID format
        if (fieldConfig.cuid) {
          fieldSchema = (fieldSchema as z.ZodString).cuid();
        }

        // Datetime format
        if (fieldConfig.datetime) {
          fieldSchema = (fieldSchema as z.ZodString).datetime();
        }

        // IP address format
        if (fieldConfig.ip) {
          fieldSchema = (fieldSchema as z.ZodString).ip({ version: fieldConfig.ip });
        }

        // Regex pattern
        if (fieldConfig.regex) {
          fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(fieldConfig.regex));
        }

        // StartsWith
        if (fieldConfig.startsWith) {
          fieldSchema = (fieldSchema as z.ZodString).startsWith(fieldConfig.startsWith);
        }

        // EndsWith
        if (fieldConfig.endsWith) {
          fieldSchema = (fieldSchema as z.ZodString).endsWith(fieldConfig.endsWith);
        }

        // Numeric
        if (fieldConfig.numeric) {
          fieldSchema = (fieldSchema as z.ZodString).regex(/^\d+$/);
        }
        break;

      case 'number':
        fieldSchema = z.number();
        
        // Number validations
        // Min value
        if (typeof fieldConfig.min === 'number') {
          fieldSchema = (fieldSchema as z.ZodNumber).min(fieldConfig.min);
        }

        // Max value
        if (typeof fieldConfig.max === 'number') {
          fieldSchema = (fieldSchema as z.ZodNumber).max(fieldConfig.max);
        }
        break;

      case 'boolean':
        fieldSchema = z.boolean();
        break;

      case 'date':
        fieldSchema = z.date();
        
        // Date validations
        // Min date
        if (typeof fieldConfig.min === 'number') {
          const minDate = new Date(fieldConfig.min);
          fieldSchema = (fieldSchema as z.ZodDate).min(minDate);
        }

        // Max date
        if (typeof fieldConfig.max === 'number') {
          const maxDate = new Date(fieldConfig.max);
          fieldSchema = (fieldSchema as z.ZodDate).max(maxDate);
        }
        break;

      default:
        // Treat unsupported types as string
        fieldSchema = z.string();
    }

    // Required status
    if (fieldConfig.required) {
      // Field is already marked as required
    } else {
      fieldSchema = fieldSchema.optional();
    }

    // Equality validation (with refine)
    if (fieldConfig.equals !== undefined) {
      if (typeof fieldConfig.equals === 'string') {
        // Equality with another field
        const targetField = fieldConfig.equals;
        
        // We can check the value of the other field with the object schema extension approach
        // We'll do extra validation after the schema is created
        shape[fieldName] = fieldSchema;
      } else if (typeof fieldConfig.equals === 'boolean') {
        // Equality with boolean value (e.g. acceptTerms: true)
        const expectedValue = fieldConfig.equals;
        fieldSchema = fieldSchema.refine(
          (value) => value === expectedValue,
          {
            message: `Must be ${expectedValue}`,
            path: [fieldName]
          }
        );
      }
      
      continue; // We've already added to the field, no need to move to other steps
    }

    // Same situation for inequality validation
    if (fieldConfig.notEquals) {
      // We can check the value of the other field with the object schema extension approach
      // We'll do extra validation after the schema is created
      shape[fieldName] = fieldSchema;
      continue;
    }

    // Custom validation functions
    if (fieldConfig.customValidators && fieldConfig.customValidators.length > 0) {
      // Simplified approach: we'll read validators on the schema but validate later
      shape[fieldName] = fieldSchema;
      continue;
    }

    // Add final schema
    shape[fieldName] = fieldSchema;
  }

  // Create and return the schema
  return z.object(shape);
}
