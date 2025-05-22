import * as z from 'zod';
import { SimpleValidationSchema, ValidationOptions } from './types';
import { buildZodSchema } from './schemaConverter';
import { translateErrors } from './errorTranslator';
import { getMessages } from './messages';

/**
 * Validate data according to the specified schema and return error messages
 * @param schema Simple validation schema
 * @param data Data to validate
 * @param options Validation options (language and custom messages)
 * @returns Array containing error messages (empty array if successful)
 */
export function validate(
  schema: SimpleValidationSchema,
  data: Record<string, any>,
  options: ValidationOptions
): string[] {
  try {
    // Get language messages
    const messages = getMessages(options.lang);
    const customMessages = options.customMessages;
    
    // Simple validation logic, full integration with Zod will take time
    const errors: string[] = [];
    
    // Check each field in the schema
    for (const [fieldName, fieldConfig] of Object.entries(schema)) {
      const value = data[fieldName];
      
      // Format field name to start with uppercase letter
      const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      // Required check
      if (fieldConfig.required && (value === undefined || value === null || value === '')) {
        let errorMessage = messages.required;
        
        // Field-based custom message check
        if (customMessages?.fields?.[fieldName]?.required) {
          errorMessage = customMessages.fields[fieldName].required as string;
        } else if (customMessages?.required) {
          errorMessage = customMessages.required;
        }
        
        errors.push(`${formattedFieldName}: ${errorMessage}`);
        continue;
      }
      
      // If value is not present and not required, skip other checks
      if (value === undefined || value === null) {
        continue;
      }

      // Type check
      const valueType = typeof value;
      let typeError = false;
      
      switch (fieldConfig.type) {
        case 'string':
          if (valueType !== 'string') {
            let errorMessage = messages.invalid_type;
            
            if (customMessages?.invalid_type) {
              errorMessage = customMessages.invalid_type;
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
            typeError = true;
          }
          break;
        case 'number':
          if (valueType !== 'number') {
            let errorMessage = messages.invalid_type;
            
            if (customMessages?.invalid_type) {
              errorMessage = customMessages.invalid_type;
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
            typeError = true;
          }
          break;
        case 'boolean':
          if (valueType !== 'boolean') {
            let errorMessage = messages.invalid_type;
            
            if (customMessages?.invalid_type) {
              errorMessage = customMessages.invalid_type;
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
            typeError = true;
          }
          break;
        case 'date':
          if (!(value instanceof Date)) {
            let errorMessage = messages.invalid_type;
            
            if (customMessages?.invalid_type) {
              errorMessage = customMessages.invalid_type;
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
            typeError = true;
          }
          break;
      }
      
      // If type error, skip other checks
      if (typeError) {
        continue;
      }

      // String validations
      if (fieldConfig.type === 'string') {
        // Minimum length check
        if (typeof fieldConfig.min === 'number' && value.length < fieldConfig.min) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.min) {
            // Field-based custom message
            const messageFunc = customMessages.fields[fieldName].min as (min: number) => string;
            errorMessage = messageFunc(fieldConfig.min);
          } else if (customMessages?.string?.min) {
            // Type-based custom message
            errorMessage = customMessages.string.min(fieldConfig.min);
          } else {
            // Default message
            errorMessage = messages.string.min(fieldConfig.min);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
        
        // Maximum length check
        if (typeof fieldConfig.max === 'number' && value.length > fieldConfig.max) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.max) {
            // Field-based custom message
            const messageFunc = customMessages.fields[fieldName].max as (max: number) => string;
            errorMessage = messageFunc(fieldConfig.max);
          } else if (customMessages?.string?.max) {
            // Type-based custom message
            errorMessage = customMessages.string.max(fieldConfig.max);
          } else {
            // Default message
            errorMessage = messages.string.max(fieldConfig.max);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
        
        // Exact length check
        if (typeof fieldConfig.length === 'number' && value.length !== fieldConfig.length) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.length) {
            // Field-based custom message
            const messageFunc = customMessages.fields[fieldName].length as (len: number) => string;
            errorMessage = messageFunc(fieldConfig.length);
          } else if (customMessages?.string?.length) {
            // Type-based custom message
            errorMessage = customMessages.string.length(fieldConfig.length);
          } else {
            // Default message
            errorMessage = messages.string.length(fieldConfig.length);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
        
        // Email format check
        if (fieldConfig.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            let errorMessage: string;
            
            // Priority order
            if (customMessages?.fields?.[fieldName]?.email) {
              // Field-based custom message
              errorMessage = customMessages.fields[fieldName].email as string;
            } else if (customMessages?.string?.email) {
              // Type-based custom message
              errorMessage = customMessages.string.email;
            } else {
              // Default message
              errorMessage = messages.string.email;
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
          }
        }
        
        // Regex format check
        if (fieldConfig.regex) {
          try {
            const regex = new RegExp(fieldConfig.regex);
            if (!regex.test(value)) {
              let errorMessage: string;
              
              // Priority order
              if (customMessages?.fields?.[fieldName]?.regex) {
                // Field-based custom message
                errorMessage = customMessages.fields[fieldName].regex as string;
              } else if (customMessages?.string?.regex) {
                // Type-based custom message
                errorMessage = customMessages.string.regex;
              } else {
                // Default message
                errorMessage = messages.string.regex;
              }
              
              errors.push(`${formattedFieldName}: ${errorMessage}`);
            }
          } catch (e) {
            errors.push(`${formattedFieldName}: Invalid regex pattern`);
          }
        }
      }
      
      // Number validations
      if (fieldConfig.type === 'number') {
        // Minimum value check
        if (typeof fieldConfig.min === 'number' && value < fieldConfig.min) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.min) {
            // Field-based custom message
            const messageFunc = customMessages.fields[fieldName].min as (min: number) => string;
            errorMessage = messageFunc(fieldConfig.min);
          } else if (customMessages?.number?.min) {
            // Type-based custom message
            errorMessage = customMessages.number.min(fieldConfig.min);
          } else {
            // Default message
            errorMessage = messages.number.min(fieldConfig.min);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
        
        // Maximum value check
        if (typeof fieldConfig.max === 'number' && value > fieldConfig.max) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.max) {
            // Field-based custom message
            const messageFunc = customMessages.fields[fieldName].max as (max: number) => string;
            errorMessage = messageFunc(fieldConfig.max);
          } else if (customMessages?.number?.max) {
            // Type-based custom message
            errorMessage = customMessages.number.max(fieldConfig.max);
          } else {
            // Default message
            errorMessage = messages.number.max(fieldConfig.max);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
      }
      
      // Equality validation
      if (fieldConfig.equals !== undefined) {
        if (typeof fieldConfig.equals === 'string') {
          const targetField = fieldConfig.equals;
          if (data[targetField] !== value) {
            let errorMessage: string;
            
            // Priority order
            if (customMessages?.fields?.[fieldName]?.equals) {
              // Field-based custom message
              const messageProvider = customMessages.fields[fieldName].equals;
              if (typeof messageProvider === 'function') {
                errorMessage = (messageProvider as (field: string) => string)(targetField);
              } else {
                errorMessage = messageProvider as string;
              }
            } else if (customMessages?.equals) {
              // General custom message
              errorMessage = customMessages.equals(targetField);
            } else {
              // Default message
              errorMessage = messages.equals(targetField);
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
          }
        } else if (typeof fieldConfig.equals === 'boolean') {
          if (value !== fieldConfig.equals) {
            let errorMessage = fieldConfig.equals ? 
              (messages.boolean?.true || "Must be true") : 
              (messages.boolean?.false || "Must be false");
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
          }
        }
      }
      
      // Inequality validation
      if (fieldConfig.notEquals) {
        const targetField = fieldConfig.notEquals;
        if (data[targetField] === value) {
          let errorMessage: string;
          
          // Priority order
          if (customMessages?.fields?.[fieldName]?.notEquals) {
            // Field-based custom message
            const messageProvider = customMessages.fields[fieldName].notEquals;
            if (typeof messageProvider === 'function') {
              errorMessage = (messageProvider as (field: string) => string)(targetField);
            } else {
              errorMessage = messageProvider as string;
            }
          } else if (customMessages?.notEquals) {
            // General custom message
            errorMessage = customMessages.notEquals(targetField);
          } else {
            // Default message
            errorMessage = messages.notEquals(targetField);
          }
          
          errors.push(`${formattedFieldName}: ${errorMessage}`);
        }
      }
      
      // Custom validations
      if (fieldConfig.customValidators && fieldConfig.customValidators.length > 0) {
        for (const validator of fieldConfig.customValidators) {
          const validationResult = validator.validator(value, data);
          
          if (validationResult !== undefined) {
            // Custom validator returned an error
            let errorMessage = validationResult;
            
            // If messageKey is specified, check custom messages
            if (validator.messageKey) {
              // Priority order
              if (customMessages?.fields?.[fieldName]?.[validator.messageKey]) {
                // Field-based custom message
                const messageProvider = customMessages.fields[fieldName][validator.messageKey];
                if (typeof messageProvider === 'function') {
                  errorMessage = (messageProvider as (value: any, data: Record<string, any>) => string)(value, data);
                } else {
                  errorMessage = messageProvider as string;
                }
              } else if (customMessages?.custom?.[validator.messageKey]) {
                // Global custom message
                const messageProvider = customMessages.custom[validator.messageKey];
                if (typeof messageProvider === 'function') {
                  errorMessage = (messageProvider as (value: any, data: Record<string, any>) => string)(value, data);
                } else {
                  errorMessage = messageProvider as string;
                }
              }
            }
            
            errors.push(`${formattedFieldName}: ${errorMessage}`);
          }
        }
      }
    }
    
    // Successful validation, return empty error array
    return errors;
  } catch (error) {
    // Return a general error message in case of error
    return ['An unexpected validation error occurred'];
  }
}

// Export type definitions
export * from './types';
