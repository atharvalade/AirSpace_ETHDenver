/**
 * Humanity Protocol API Service
 * 
 * This service provides methods to interact with the Humanity Protocol API
 * for creating and verifying verifiable credentials.
 */

import { 
  HUMANITY_PROTOCOL_API_KEY, 
  HUMANITY_PROTOCOL_API_BASE_URL,
  USE_FALLBACK_IF_NO_API_KEY
} from '@/config/humanityProtocol';

// Types for Humanity Protocol API
export interface VerifiableCredential {
  issuer: string;
  validFrom: string;
  validUntil: string;
  id: string;
  "@context": string[];
  type: string[];
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  credentialStatus: {
    type: string;
    chain_id: string;
    revocation_registry_contract_address: string;
    did_registry_contract_address: string;
  };
  proof: {
    type: string;
    cryptosuite: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

export interface IssueCredentialResponse {
  message: string;
  credential: VerifiableCredential;
}

export interface VerifyCredentialResponse {
  isValid: boolean;
  message: string;
}

export interface ListCredentialsResponse {
  data: VerifiableCredential[];
}

export interface RevokeCredentialResponse {
  status: string;
  message: string;
}

// Humanity Protocol API Service
class HumanityProtocolService {
  private apiKey: string | null = null;
  private baseUrl: string = HUMANITY_PROTOCOL_API_BASE_URL;
  private fallbackMode: boolean = true;

  constructor() {
    // Try to initialize with the API key from the environment
    if (HUMANITY_PROTOCOL_API_KEY) {
      this.initialize(HUMANITY_PROTOCOL_API_KEY);
    } else if (!USE_FALLBACK_IF_NO_API_KEY) {
      console.warn('Humanity Protocol API key not found and fallback mode is disabled.');
    } else {
      console.warn('Humanity Protocol API key not found. Using fallback mode.');
    }
  }

  /**
   * Initialize the service with an API key
   * @param apiKey - The API key for Humanity Protocol
   */
  initialize(apiKey: string) {
    if (!apiKey) {
      console.warn('Empty API key provided. Staying in fallback mode.');
      return;
    }
    
    this.apiKey = apiKey;
    this.fallbackMode = false;
    console.log('Humanity Protocol service initialized with API key');
  }

  /**
   * Check if the service is in fallback mode
   * @returns boolean indicating if fallback mode is active
   */
  isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  /**
   * Helper method to make API requests
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param body - Request body (optional)
   * @returns Promise with the API response
   */
  private async makeRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
    if (this.fallbackMode) {
      throw new Error('Humanity Protocol service is in fallback mode. Please initialize with an API key.');
    }

    if (!this.apiKey) {
      throw new Error('API key not set. Please initialize the service first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': this.apiKey
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Humanity Protocol API error:', error);
      throw error;
    }
  }

  /**
   * Issue a verifiable credential
   * @param subjectAddress - The address of the credential subject
   * @param claims - Key-value pairs of claims to include in the credential
   * @returns Promise with the issued credential response
   */
  async issueCredential(subjectAddress: string, claims: Record<string, any>): Promise<IssueCredentialResponse> {
    return this.makeRequest<IssueCredentialResponse>('/credentials/issue', 'POST', {
      subject_address: subjectAddress,
      claims
    });
  }

  /**
   * Verify a verifiable credential
   * @param credential - The verifiable credential to verify
   * @returns Promise with the verification response
   */
  async verifyCredential(credential: VerifiableCredential): Promise<VerifyCredentialResponse> {
    return this.makeRequest<VerifyCredentialResponse>('/credentials/verify', 'POST', {
      credential
    });
  }

  /**
   * List verifiable credentials
   * @param holderDid - Optional DID of the credential holder
   * @returns Promise with the list of credentials
   */
  async listCredentials(holderDid?: string): Promise<ListCredentialsResponse> {
    const endpoint = holderDid 
      ? `/credentials/list?holderDid=${encodeURIComponent(holderDid)}`
      : '/credentials/list';
    
    return this.makeRequest<ListCredentialsResponse>(endpoint, 'GET');
  }

  /**
   * Revoke a verifiable credential
   * @param credentialId - The ID of the credential to revoke
   * @returns Promise with the revocation response
   */
  async revokeCredential(credentialId: string): Promise<RevokeCredentialResponse> {
    return this.makeRequest<RevokeCredentialResponse>('/credentials/revoke', 'POST', {
      credentialId
    });
  }

  /**
   * Create a human credential for a new wallet
   * @param address - The wallet address
   * @returns Promise with the issued credential response
   */
  async createHumanCredential(address: string): Promise<IssueCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackCreateHumanCredential(address);
    }
    
    // For a new wallet, we create a basic human credential
    return this.issueCredential(address, {
      isHuman: true,
      createdAt: new Date().toISOString(),
      humanityVerified: true
    });
  }

  /**
   * Verify if an address has a valid human credential
   * @param address - The wallet address to check
   * @returns Promise with boolean indicating if the address has a valid human credential
   */
  async verifyHumanCredential(address: string): Promise<boolean> {
    if (this.fallbackMode) {
      return this.fallbackVerifyHumanCredential(address);
    }
    
    try {
      // Convert address to DID format
      const holderDid = `did:ethr:${address}`;
      
      // Get credentials for this holder
      const response = await this.listCredentials(holderDid);
      
      // If no credentials found, return false
      if (!response.data || response.data.length === 0) {
        return false;
      }
      
      // Find the human credential
      const humanCredential = response.data.find(cred => 
        cred.credentialSubject.isHuman === true || 
        cred.credentialSubject.humanityVerified === true
      );
      
      if (!humanCredential) {
        return false;
      }
      
      // Verify the credential
      const verificationResult = await this.verifyCredential(humanCredential);
      return verificationResult.isValid;
    } catch (error) {
      console.error('Error verifying human credential:', error);
      return false;
    }
  }

  // Fallback methods for when API key is not available
  
  /**
   * Fallback method to simulate creating a human credential
   * @param address - The wallet address
   * @returns Promise with a simulated credential
   */
  async fallbackCreateHumanCredential(address: string): Promise<any> {
    console.log('Using fallback mode to create human credential for', address);
    
    // Simulate API response
    return {
      message: "Credential issued successfully (FALLBACK MODE)",
      credential: {
        id: `urn:uuid:${this.generateUUID()}`,
        issuer: "did:key:fallback-issuer",
        validFrom: new Date().toISOString(),
        validUntil: "",
        "@context": ["https://www.w3.org/ns/credentials/v2"],
        type: ["VerifiableCredential"],
        credentialSubject: {
          id: `did:ethr:${address}`,
          isHuman: true,
          createdAt: new Date().toISOString(),
          humanityVerified: true
        }
      }
    };
  }

  /**
   * Fallback method to simulate verifying a human credential
   * @param address - The wallet address
   * @returns Promise with a boolean (always true in fallback mode)
   */
  async fallbackVerifyHumanCredential(address: string): Promise<boolean> {
    console.log('Using fallback mode to verify human credential for', address);
    
    // Check if we have a stored credential in localStorage
    if (typeof window !== 'undefined') {
      const storedCredential = localStorage.getItem(`humanity-credential-${address}`);
      return !!storedCredential;
    }
    
    // In fallback mode without localStorage, we'll just return true
    return true;
  }

  /**
   * Generate a UUID for fallback mode
   * @returns A random UUID string
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export a singleton instance
export const humanityProtocolService = new HumanityProtocolService(); 