import type { Client } from './types';
import { MOCK_CLIENTS } from './constants';

const STORAGE_KEY = 'colibrinvest_clients';

/**
 * A "reviver" function for JSON.parse to convert ISO date strings back into Date objects.
 * This is crucial because JSON.stringify turns Date objects into strings.
 * @param key The key of the property being processed.
 * @param value The value of the property being processed.
 * @returns The original value, or a new Date object if the value was a date string.
 */
const reviveDates = (key: string, value: any): any => {
  // A regex to match the ISO 8601 format produced by Date.toISOString()
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (typeof value === 'string' && isoDateRegex.test(value)) {
    return new Date(value);
  }
  return value;
};

/**
 * Loads the list of clients from local storage.
 * If no data is found, it initializes the storage with mock data.
 * It uses a reviver to correctly parse date strings back into Date objects.
 * @returns An array of Client objects.
 */
export const loadClients = (): Client[] => {
  try {
    const storedClients = localStorage.getItem(STORAGE_KEY);
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients, reviveDates);
      return parsedClients as Client[];
    }
  } catch (error) {
    console.error("Failed to load clients from local storage:", error);
    // If parsing fails, we'll fall back to mock data.
  }

  // If storage is empty or there was an error, initialize with mock data.
  saveClients(MOCK_CLIENTS);
  return MOCK_CLIENTS;
};

/**
 * Saves the list of clients to local storage.
 * The data is converted to a JSON string before being stored.
 * @param clients The array of Client objects to save.
 */
export const saveClients = (clients: Client[]): void => {
  try {
    const clientsJson = JSON.stringify(clients);
    localStorage.setItem(STORAGE_KEY, clientsJson);
  } catch (error) {
    console.error("Failed to save clients to local storage:", error);
  }
};
