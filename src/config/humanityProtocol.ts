/**
 * Humanity Protocol Configuration
 * 
 * This file contains configuration settings for the Humanity Protocol integration.
 */

// The API key for the Humanity Protocol API
export const HUMANITY_PROTOCOL_API_KEY = '7787fd64-9a23-44b6-97c2-271e5f4c60c1';

// Whether to use fallback mode if the API key is not available
export const USE_FALLBACK_IF_NO_API_KEY = false;

// Base URL for the Humanity Protocol API
export const HUMANITY_PROTOCOL_API_BASE_URL = 'https://issuer.humanity.org';

// API Endpoints
export const HUMANITY_PROTOCOL_ENDPOINTS = {
  ISSUE_CREDENTIAL: '/api/v1/credentials/issue',
  VERIFY_CREDENTIAL: '/api/v1/credentials/verify',
  REVOKE_CREDENTIAL: '/api/v1/credentials/revoke',
  GET_CREDENTIAL_STATUS: '/api/v1/credentials/status',
  GET_ISSUER_INFO: '/api/v1/issuer',
  GET_SCHEMAS: '/api/v1/schemas',
};

// Credential Types
export const CREDENTIAL_TYPES = {
  PROPERTY_OWNERSHIP: 'PropertyOwnership',
  AIR_RIGHTS: 'AirRights',
  IDENTITY: 'Identity',
  DEVELOPER: 'Developer',
};

// Default Credential Options
export const DEFAULT_CREDENTIAL_OPTIONS = {
  validityDays: 365, // Default validity of 1 year
  revocable: true,
  proofType: 'Ed25519Signature2020',
}; 