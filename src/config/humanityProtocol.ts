/**
 * Humanity Protocol Configuration
 * 
 * This file contains configuration settings for the Humanity Protocol integration.
 */

// The API key for the Humanity Protocol API
// This will be replaced with the actual API key when provided
export const HUMANITY_PROTOCOL_API_KEY = process.env.NEXT_PUBLIC_HUMANITY_PROTOCOL_API_KEY || '';

// Whether to use fallback mode if the API key is not available
export const USE_FALLBACK_IF_NO_API_KEY = true;

// Base URL for the Humanity Protocol API
export const HUMANITY_PROTOCOL_API_BASE_URL = 'https://issuer.humanity.org'; 