import * as z from 'zod';
import { CustomMessages } from './types';
import { getMessages, MessageDictionary } from './messages';

/**
 * Returns understandable error messages from a Zod error object
 * @param error Zod error object
 * @param lang Language code
 * @param customMessages Custom messages
 * @param schema Original schema
 * @returns Array containing error messages
 */
export function translateErrors(
  error: z.ZodError,
  lang: string,
  customMessages?: CustomMessages,
  schema?: Record<string, any>
): string[] {
  const messages = getMessages(lang);
  const result: string[] = [];
  
  for (const issue of error.issues) {
    // Determine field name (from path array)
    const fieldName = issue.path.length > 0 ? issue.path[issue.path.length - 1].toString() : '';
    
    // Get and add formatted message
    const message = getTranslatedMessage(issue, fieldName, lang, customMessages || {}, messages, schema || {});
    
    if (message) {
      result.push(message);
    }
  }
  
  return result;
}

/**
 * Returns message with correct translation for a specific error
 * @param issue Zod error object
 * @param fieldName Field name
 * @param lang Language code
 * @param customMessages Custom messages
 * @param messages Language messages
 * @param schema Original schema
 * @returns Translated error message
 */
export function getTranslatedMessage(
  issue: z.ZodIssue,
  fieldName: string,
  lang: string,
  customMessages: CustomMessages,
  messages: MessageDictionary,
  schema: Record<string, any>
): string {
  // Find appropriate schema rule
  const fieldConfig = fieldName ? schema[fieldName] : null;
  
  // For message priority order, first look at field-based custom message
  // 1. Field-based custom validator messages
  if (
    issue.code === 'custom' && 
    issue.params?.messageKey && 
    customMessages.fields?.[fieldName]?.[issue.params.messageKey]
  ) {
    const messageProvider = customMessages.fields[fieldName][issue.params.messageKey];
    
    if (typeof messageProvider === 'function') {
      return formatMessage(fieldName, messageProvider(issue.path, issue.params));
    }
    
    return formatMessage(fieldName, messageProvider);
  }
  
  // 2. Other field-based custom messages
  if (customMessages.fields?.[fieldName]) {
    // Check if there are customized messages for the field
    const fieldMessages = customMessages.fields[fieldName];
    
    // Find message based on code/rule type
    switch (issue.code) {
      case 'too_small':
        if (issue.type === 'string' && fieldMessages.min && typeof issue.minimum === 'number') {
          const messageFunc = fieldMessages.min as (min: number) => string;
          return formatMessage(fieldName, messageFunc(issue.minimum));
        }
        break;
        
      case 'too_big':
        if (issue.type === 'string' && fieldMessages.max && typeof issue.maximum === 'number') {
          const messageFunc = fieldMessages.max as (max: number) => string;
          return formatMessage(fieldName, messageFunc(issue.maximum));
        }
        break;
        
      case 'invalid_string':
        if (issue.validation === 'email' && fieldMessages.email) {
          return formatMessage(fieldName, fieldMessages.email as string);
        }
        break;
        
      case 'invalid_type':
        if (fieldMessages.invalid_type) {
          return formatMessage(fieldName, fieldMessages.invalid_type as string);
        }
        break;
        
      case 'invalid_literal':
      case 'unrecognized_keys':
      case 'invalid_union':
      case 'invalid_union_discriminator':
      case 'invalid_enum_value':
      case 'invalid_arguments':
      case 'invalid_return_type':
      case 'invalid_date':
      case 'invalid_string':
      case 'too_small':
      case 'too_big':
      case 'invalid_intersection_types':
      case 'not_multiple_of':
      case 'not_finite':
      case 'custom':
        // All possible Zod error codes
        break;
    }
  }
  
  // 3. Global custom validator messages
  if (
    issue.code === 'custom' && 
    issue.params?.messageKey && 
    customMessages.custom?.[issue.params.messageKey]
  ) {
    const messageProvider = customMessages.custom[issue.params.messageKey];
    
    if (typeof messageProvider === 'function') {
      return formatMessage(fieldName, messageProvider(issue.path, issue.params));
    }
    
    return formatMessage(fieldName, messageProvider);
  }
  
  // 4. Custom messages specific to general library validators
  switch (issue.code) {
    case 'invalid_string':
      if (issue.validation === 'email' && customMessages.string?.email) {
        return formatMessage(fieldName, customMessages.string.email);
      }
      if (issue.validation === 'url' && customMessages.string?.url) {
        return formatMessage(fieldName, customMessages.string.url);
      }
      if (issue.validation === 'uuid' && customMessages.string?.uuid) {
        return formatMessage(fieldName, customMessages.string.uuid);
      }
      if (issue.validation === 'cuid' && customMessages.string?.cuid) {
        return formatMessage(fieldName, customMessages.string.cuid);
      }
      if (issue.validation === 'datetime' && customMessages.string?.datetime) {
        return formatMessage(fieldName, customMessages.string.datetime);
      }
      if (issue.validation === 'regex' && customMessages.string?.regex) {
        return formatMessage(fieldName, customMessages.string.regex);
      }
      break;
      
    case 'too_small':
      if (issue.type === 'string' && customMessages.string?.min && typeof issue.minimum === 'number') {
        return formatMessage(fieldName, customMessages.string.min(issue.minimum));
      }
      if (issue.type === 'number' && customMessages.number?.min && typeof issue.minimum === 'number') {
        return formatMessage(fieldName, customMessages.number.min(issue.minimum));
      }
      break;
      
    case 'too_big':
      if (issue.type === 'string' && customMessages.string?.max && typeof issue.maximum === 'number') {
        return formatMessage(fieldName, customMessages.string.max(issue.maximum));
      }
      if (issue.type === 'number' && customMessages.number?.max && typeof issue.maximum === 'number') {
        return formatMessage(fieldName, customMessages.number.max(issue.maximum));
      }
      break;
      
    case 'custom':
      // Special refine rules like Equals/notEquals
      if (fieldConfig?.equals && typeof fieldConfig.equals === 'string' && customMessages.equals) {
        return formatMessage(fieldName, customMessages.equals(fieldConfig.equals));
      }
      if (fieldConfig?.notEquals && customMessages.notEquals) {
        return formatMessage(fieldName, customMessages.notEquals(fieldConfig.notEquals));
      }
      break;
  }
  
  // 5. Custom messages specific to general Zod error types
  switch (issue.code) {
    case 'invalid_type':
      if (customMessages.invalid_type) {
        return formatMessage(fieldName, customMessages.invalid_type);
      }
      break;
      
    default:
      // Use custom message for other codes if available
      break;
  }
  
  // 6. Default library messages in the selected language
  switch (issue.code) {
    case 'invalid_type':
      return formatMessage(fieldName, messages.invalid_type);
      
    case 'invalid_string':
      if (issue.validation === 'email') {
        return formatMessage(fieldName, messages.string.email);
      }
      if (issue.validation === 'url') {
        return formatMessage(fieldName, messages.string.url);
      }
      if (issue.validation === 'uuid') {
        return formatMessage(fieldName, messages.string.uuid);
      }
      if (issue.validation === 'cuid') {
        return formatMessage(fieldName, messages.string.cuid);
      }
      if (issue.validation === 'datetime') {
        return formatMessage(fieldName, messages.string.datetime);
      }
      if (issue.validation === 'regex') {
        return formatMessage(fieldName, messages.string.regex);
      }
      break;
      
    case 'too_small':
      if (issue.type === 'string' && typeof issue.minimum === 'number') {
        return formatMessage(fieldName, messages.string.min(issue.minimum));
      }
      if (issue.type === 'number' && typeof issue.minimum === 'number') {
        return formatMessage(fieldName, messages.number.min(issue.minimum));
      }
      break;
      
    case 'too_big':
      if (issue.type === 'string' && typeof issue.maximum === 'number') {
        return formatMessage(fieldName, messages.string.max(issue.maximum));
      }
      if (issue.type === 'number' && typeof issue.maximum === 'number') {
        return formatMessage(fieldName, messages.number.max(issue.maximum));
      }
      break;
  }
  
  // Couldn't find error message, use Zod's own error
  return formatMessage(fieldName, issue.message);
}

/**
 * Helper function to add field name to message
 * @param fieldName Field name
 * @param message Error message
 * @returns Formatted error message
 */
function formatMessage(fieldName: string, message: string): string {
  if (!fieldName) return message;
  
  // First letter should be uppercase
  const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  
  // If message already starts with field name, return message as is
  if (message.startsWith(formattedFieldName)) {
    return message;
  }
  
  // Field name + error message
  return `${formattedFieldName}: ${message}`;
}
