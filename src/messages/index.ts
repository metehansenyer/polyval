import { enMessages } from './en';
import { trMessages } from './tr';

export type MessageDictionary = typeof enMessages;

// Type-safe map for language messages
export const messages: Record<string, MessageDictionary> = {
  en: enMessages,
  tr: trMessages,
};

// Default language
export const DEFAULT_LANGUAGE = 'en';

/**
 * Returns message dictionary for the given language
 * @param lang Language code
 * @returns Message dictionary
 */
export function getMessages(lang: string): MessageDictionary {
  return messages[lang] || messages[DEFAULT_LANGUAGE];
}
