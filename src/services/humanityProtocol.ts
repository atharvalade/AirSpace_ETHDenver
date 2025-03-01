/**
 * Humanity Protocol API Service
 * 
 * This service provides methods to interact with the Humanity Protocol API
 * for creating and verifying verifiable credentials.
 */

import { 
  HUMANITY_PROTOCOL_API_KEY, 
  HUMANITY_PROTOCOL_API_BASE_URL,
  HUMANITY_PROTOCOL_ENDPOINTS,
  USE_FALLBACK_IF_NO_API_KEY,
  CREDENTIAL_TYPES,
  DEFAULT_CREDENTIAL_OPTIONS
} from '@/config/humanityProtocol';
import { toast } from 'react-hot-toast';

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

export interface IssueCredentialRequest {
  subjectDid: string;
  type: string;
  claims: Record<string, any>;
  validityDays?: number;
  revocable?: boolean;
  proofType?: string;
}

export interface IssueCredentialResponse {
  message: string;
  credential: VerifiableCredential;
}

export interface VerifyCredentialResponse {
  isValid: boolean;
  message: string;
  details?: {
    expired?: boolean;
    revoked?: boolean;
    signatureValid?: boolean;
  };
}

export interface CredentialStatusResponse {
  id: string;
  status: 'active' | 'revoked' | 'expired';
  revoked: boolean;
  expired: boolean;
}

export interface ListCredentialsResponse {
  credentials: VerifiableCredential[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RevokeCredentialResponse {
  status: string;
  message: string;
  transactionHash?: string;
}

export interface IssuerInfoResponse {
  did: string;
  name: string;
  description: string;
  url: string;
  credentialsIssued: number;
}

export interface SchemaResponse {
  schemas: Array<{
    id: string;
    name: string;
    description: string;
    properties: Record<string, any>;
    required: string[];
  }>;
}

// Humanity Protocol API Service
class HumanityProtocolService {
  private apiKey: string = HUMANITY_PROTOCOL_API_KEY;
  private baseUrl: string = HUMANITY_PROTOCOL_API_BASE_URL;
  private fallbackMode: boolean = USE_FALLBACK_IF_NO_API_KEY && !HUMANITY_PROTOCOL_API_KEY;

  constructor() {
    if (this.fallbackMode) {
      console.warn('Humanity Protocol service initialized in fallback mode.');
    } else {
      console.log('Humanity Protocol service initialized with API key.');
    }
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
      throw new Error('Humanity Protocol service is in fallback mode. Cannot make real API requests.');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the error response is not valid JSON, use the text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Humanity Protocol API error:', error);
      throw error;
    }
  }

  /**
   * Issue a verifiable credential
   * @param request - The credential issuance request
   * @returns Promise with the issued credential response
   */
  async issueCredential(request: IssueCredentialRequest): Promise<IssueCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackIssueCredential(request);
    }

    const { subjectDid, type, claims, validityDays, revocable, proofType } = request;
    
    const requestBody = {
      subjectDid,
      type,
      claims,
      validityDays: validityDays || DEFAULT_CREDENTIAL_OPTIONS.validityDays,
      revocable: revocable !== undefined ? revocable : DEFAULT_CREDENTIAL_OPTIONS.revocable,
      proofType: proofType || DEFAULT_CREDENTIAL_OPTIONS.proofType
    };

    return this.makeRequest<IssueCredentialResponse>(
      HUMANITY_PROTOCOL_ENDPOINTS.ISSUE_CREDENTIAL, 
      'POST', 
      requestBody
    );
  }

  /**
   * Verify a verifiable credential
   * @param credential - The verifiable credential to verify
   * @returns Promise with the verification response
   */
  async verifyCredential(credential: VerifiableCredential): Promise<VerifyCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackVerifyCredential(credential);
    }

    return this.makeRequest<VerifyCredentialResponse>(
      HUMANITY_PROTOCOL_ENDPOINTS.VERIFY_CREDENTIAL, 
      'POST', 
      { credential }
    );
  }

  /**
   * Get the status of a credential
   * @param credentialId - The ID of the credential
   * @returns Promise with the credential status
   */
  async getCredentialStatus(credentialId: string): Promise<CredentialStatusResponse> {
    if (this.fallbackMode) {
      return this.fallbackGetCredentialStatus(credentialId);
    }

    return this.makeRequest<CredentialStatusResponse>(
      `${HUMANITY_PROTOCOL_ENDPOINTS.GET_CREDENTIAL_STATUS}/${encodeURIComponent(credentialId)}`, 
      'GET'
    );
  }

  /**
   * List verifiable credentials for a holder
   * @param holderDid - DID of the credential holder
   * @param page - Page number (optional)
   * @param pageSize - Page size (optional)
   * @returns Promise with the list of credentials
   */
  async listCredentials(holderDid: string, page: number = 1, pageSize: number = 10): Promise<ListCredentialsResponse> {
    if (this.fallbackMode) {
      return this.fallbackListCredentials(holderDid);
    }

    const queryParams = new URLSearchParams({
      holderDid,
      page: page.toString(),
      pageSize: pageSize.toString()
    }).toString();
    
    return this.makeRequest<ListCredentialsResponse>(
      `${HUMANITY_PROTOCOL_ENDPOINTS.GET_SCHEMAS}?${queryParams}`, 
      'GET'
    );
  }

  /**
   * Revoke a verifiable credential
   * @param credentialId - The ID of the credential to revoke
   * @returns Promise with the revocation response
   */
  async revokeCredential(credentialId: string): Promise<RevokeCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackRevokeCredential(credentialId);
    }

    return this.makeRequest<RevokeCredentialResponse>(
      HUMANITY_PROTOCOL_ENDPOINTS.REVOKE_CREDENTIAL, 
      'POST', 
      { credentialId }
    );
  }

  /**
   * Get information about the issuer
   * @returns Promise with the issuer information
   */
  async getIssuerInfo(): Promise<IssuerInfoResponse> {
    if (this.fallbackMode) {
      return this.fallbackGetIssuerInfo();
    }

    return this.makeRequest<IssuerInfoResponse>(
      HUMANITY_PROTOCOL_ENDPOINTS.GET_ISSUER_INFO, 
      'GET'
    );
  }

  /**
   * Get available credential schemas
   * @returns Promise with the schemas
   */
  async getSchemas(): Promise<SchemaResponse> {
    if (this.fallbackMode) {
      return this.fallbackGetSchemas();
    }

    return this.makeRequest<SchemaResponse>(
      HUMANITY_PROTOCOL_ENDPOINTS.GET_SCHEMAS, 
      'GET'
    );
  }

  /**
   * Create a property ownership credential
   * @param address - The wallet address
   * @param propertyDetails - Details about the property
   * @returns Promise with the issued credential response
   */
  async createPropertyOwnershipCredential(
    address: string, 
    propertyDetails: {
      propertyAddress: string;
      currentHeight: number;
      maximumHeight: number;
      availableFloors: number;
      coordinates?: { latitude: number; longitude: number };
      [key: string]: any;
    }
  ): Promise<IssueCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackCreatePropertyOwnershipCredential(address, propertyDetails);
    }
    
    const subjectDid = this.addressToDid(address);
    
    return this.issueCredential({
      subjectDid,
      type: CREDENTIAL_TYPES.PROPERTY_OWNERSHIP,
      claims: {
        ...propertyDetails,
        verifiedAt: new Date().toISOString(),
        ownershipVerified: true
      }
    });
  }

  /**
   * Create an air rights credential
   * @param address - The wallet address
   * @param airRightsDetails - Details about the air rights
   * @returns Promise with the issued credential response
   */
  async createAirRightsCredential(
    address: string, 
    airRightsDetails: {
      propertyAddress: string;
      currentHeight: number;
      maximumHeight: number;
      availableFloors: number;
      price: number;
      coordinates?: { latitude: number; longitude: number };
      [key: string]: any;
    }
  ): Promise<IssueCredentialResponse> {
    if (this.fallbackMode) {
      return this.fallbackCreateAirRightsCredential(address, airRightsDetails);
    }
    
    const subjectDid = this.addressToDid(address);
    
    return this.issueCredential({
      subjectDid,
      type: CREDENTIAL_TYPES.AIR_RIGHTS,
      claims: {
        ...airRightsDetails,
        verifiedAt: new Date().toISOString(),
        airRightsVerified: true
      }
    });
  }

  /**
   * Verify if an address has a valid property ownership credential
   * @param address - The wallet address to check
   * @returns Promise with boolean indicating if the address has a valid property ownership credential
   */
  async verifyPropertyOwnership(address: string): Promise<boolean> {
    if (this.fallbackMode) {
      return this.fallbackVerifyPropertyOwnership(address);
    }
    
    try {
      const holderDid = this.addressToDid(address);
      
      // Get credentials for this holder
      const response = await this.listCredentials(holderDid);
      
      // If no credentials found, return false
      if (!response.credentials || response.credentials.length === 0) {
        return false;
      }
      
      // Find the property ownership credential
      const propertyCredential = response.credentials.find(cred => 
        cred.type.includes(CREDENTIAL_TYPES.PROPERTY_OWNERSHIP) && 
        cred.credentialSubject.ownershipVerified === true
      );
      
      if (!propertyCredential) {
        return false;
      }
      
      // Verify the credential
      const verificationResult = await this.verifyCredential(propertyCredential);
      return verificationResult.isValid;
    } catch (error) {
      console.error('Error verifying property ownership credential:', error);
      toast.error('Failed to verify property ownership');
      return false;
    }
  }

  /**
   * Helper method to convert an Ethereum address to a DID
   * @param address - Ethereum address
   * @returns DID string
   */
  public addressToDid(address: string): string {
    // Ensure the address is properly formatted
    const formattedAddress = address.startsWith('0x') ? address : `0x${address}`;
    return `did:ethr:${formattedAddress.toLowerCase()}`;
  }

  // Fallback methods for when API key is not available or for testing
  
  private fallbackIssueCredential(request: IssueCredentialRequest): Promise<IssueCredentialResponse> {
    console.log('Using fallback issueCredential with request:', request);
    
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(now.getDate() + (request.validityDays || DEFAULT_CREDENTIAL_OPTIONS.validityDays));
    
    const mockCredential: VerifiableCredential = {
      issuer: "did:ethr:0xmockissuer",
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
      id: `urn:uuid:${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      type: ["VerifiableCredential", request.type],
      credentialSubject: {
        id: request.subjectDid,
        ...request.claims
      },
      credentialStatus: {
        type: "RevocationList2020Status",
        chain_id: "11155111", // Sepolia testnet
        revocation_registry_contract_address: "0xmockrevocationregistry",
        did_registry_contract_address: "0xmockdidregistry"
      },
      proof: {
        type: request.proofType || DEFAULT_CREDENTIAL_OPTIONS.proofType,
        cryptosuite: "eddsa-2022",
        created: now.toISOString(),
        verificationMethod: "did:ethr:0xmockissuer#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "mockproofvalue"
      }
    };
    
    return Promise.resolve({
      message: "Credential issued successfully (MOCK)",
      credential: mockCredential
    });
  }
  
  private fallbackVerifyCredential(credential: VerifiableCredential): Promise<VerifyCredentialResponse> {
    console.log('Using fallback verifyCredential with credential:', credential);
    
    // Always return valid in fallback mode
    return Promise.resolve({
      isValid: true,
      message: "Credential is valid (MOCK)",
      details: {
        expired: false,
        revoked: false,
        signatureValid: true
      }
    });
  }
  
  private fallbackGetCredentialStatus(credentialId: string): Promise<CredentialStatusResponse> {
    console.log('Using fallback getCredentialStatus for ID:', credentialId);
    
    return Promise.resolve({
      id: credentialId,
      status: 'active',
      revoked: false,
      expired: false
    });
  }
  
  private fallbackListCredentials(holderDid: string): Promise<ListCredentialsResponse> {
    console.log('Using fallback listCredentials for holder:', holderDid);
    
    // Return empty list in fallback mode
    return Promise.resolve({
      credentials: [],
      total: 0,
      page: 1,
      pageSize: 10
    });
  }
  
  private fallbackRevokeCredential(credentialId: string): Promise<RevokeCredentialResponse> {
    console.log('Using fallback revokeCredential for ID:', credentialId);
    
    return Promise.resolve({
      status: "success",
      message: "Credential revoked successfully (MOCK)",
      transactionHash: "0xmocktransactionhash"
    });
  }
  
  private fallbackGetIssuerInfo(): Promise<IssuerInfoResponse> {
    console.log('Using fallback getIssuerInfo');
    
    return Promise.resolve({
      did: "did:ethr:0xmockissuer",
      name: "AirSpace Mock Issuer",
      description: "Mock issuer for AirSpace development and testing",
      url: "https://airspace.xyz",
      credentialsIssued: 0
    });
  }
  
  private fallbackGetSchemas(): Promise<SchemaResponse> {
    console.log('Using fallback getSchemas');
    
    return Promise.resolve({
      schemas: [
        {
          id: "PropertyOwnership",
          name: "Property Ownership Credential",
          description: "Verifies ownership of a property",
          properties: {
            propertyAddress: { type: "string" },
            currentHeight: { type: "number" },
            maximumHeight: { type: "number" },
            availableFloors: { type: "number" },
            ownershipVerified: { type: "boolean" }
          },
          required: ["propertyAddress", "ownershipVerified"]
        },
        {
          id: "AirRights",
          name: "Air Rights Credential",
          description: "Verifies ownership of air rights for a property",
          properties: {
            propertyAddress: { type: "string" },
            currentHeight: { type: "number" },
            maximumHeight: { type: "number" },
            availableFloors: { type: "number" },
            price: { type: "number" },
            airRightsVerified: { type: "boolean" }
          },
          required: ["propertyAddress", "currentHeight", "maximumHeight", "airRightsVerified"]
        }
      ]
    });
  }
  
  private fallbackCreatePropertyOwnershipCredential(
    address: string, 
    propertyDetails: any
  ): Promise<IssueCredentialResponse> {
    console.log('Using fallback createPropertyOwnershipCredential for address:', address);
    
    const subjectDid = this.addressToDid(address);
    
    return this.fallbackIssueCredential({
      subjectDid,
      type: CREDENTIAL_TYPES.PROPERTY_OWNERSHIP,
      claims: {
        ...propertyDetails,
        verifiedAt: new Date().toISOString(),
        ownershipVerified: true
      }
    });
  }
  
  private fallbackCreateAirRightsCredential(
    address: string, 
    airRightsDetails: any
  ): Promise<IssueCredentialResponse> {
    console.log('Using fallback createAirRightsCredential for address:', address);
    
    const subjectDid = this.addressToDid(address);
    
    return this.fallbackIssueCredential({
      subjectDid,
      type: CREDENTIAL_TYPES.AIR_RIGHTS,
      claims: {
        ...airRightsDetails,
        verifiedAt: new Date().toISOString(),
        airRightsVerified: true
      }
    });
  }
  
  private fallbackVerifyPropertyOwnership(address: string): Promise<boolean> {
    console.log('Using fallback verifyPropertyOwnership for address:', address);
    
    // Always return true in fallback mode
    return Promise.resolve(true);
  }
}

export default new HumanityProtocolService(); 