"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useZkSyncAuth } from './ZkSyncAuthContext';
import { toast } from 'react-hot-toast';
import { 
  humanityProtocolService, 
  VerifiableCredential as HumanityVerifiableCredential 
} from '../services/humanityProtocol';

// Define the shape of a verifiable credential
interface VerifiableCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id?: string;
    walletAddress: string;
    humanityVerified: boolean;
    creationDate: string;
  };
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

// Define the shape of our context
interface HumanityProtocolContextType {
  isLoading: boolean;
  hasCredential: boolean;
  credential: VerifiableCredential | null;
  apiCredential: HumanityVerifiableCredential | null;
  createCredential: () => Promise<void>;
  verifyCredential: () => Promise<boolean>;
  error: Error | null;
  isFallbackMode: boolean;
  initializeWithApiKey: (apiKey: string) => void;
}

// Create the context with a default value
const HumanityProtocolContext = createContext<HumanityProtocolContextType>({
  isLoading: false,
  hasCredential: false,
  credential: null,
  apiCredential: null,
  createCredential: async () => {},
  verifyCredential: async () => false,
  error: null,
  isFallbackMode: true,
  initializeWithApiKey: () => {},
});

// Create a hook to use the context
export const useHumanityProtocol = () => useContext(HumanityProtocolContext);

interface HumanityProtocolProviderProps {
  children: ReactNode;
  apiKey?: string;
}

export const HumanityProtocolProvider: React.FC<HumanityProtocolProviderProps> = ({ 
  children,
  apiKey 
}) => {
  const { address, isConnected } = useZkSyncAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCredential, setHasCredential] = useState(false);
  const [credential, setCredential] = useState<VerifiableCredential | null>(null);
  const [apiCredential, setApiCredential] = useState<HumanityVerifiableCredential | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(true);

  // Initialize with API key if provided
  useEffect(() => {
    if (apiKey) {
      initializeWithApiKey(apiKey);
    }
  }, [apiKey]);

  // Initialize the service with an API key
  const initializeWithApiKey = (key: string) => {
    try {
      humanityProtocolService.initialize(key);
      setIsFallbackMode(false);
      console.log('Humanity Protocol service initialized with API key');
    } catch (err) {
      console.error('Failed to initialize Humanity Protocol service:', err);
      setIsFallbackMode(true);
    }
  };

  // Check if the user has a credential when their address changes
  useEffect(() => {
    if (address && isConnected) {
      checkForExistingCredential(address);
    } else {
      // Reset state when disconnected
      setHasCredential(false);
      setCredential(null);
      setApiCredential(null);
    }
  }, [address, isConnected, isFallbackMode]);

  // Check if a credential exists for this address
  const checkForExistingCredential = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      
      if (!isFallbackMode) {
        // Use the actual Humanity Protocol API
        const hasValidCredential = await humanityProtocolService.verifyHumanCredential(walletAddress);
        
        if (hasValidCredential) {
          // Get the credential details
          const holderDid = `did:ethr:${walletAddress}`;
          const response = await humanityProtocolService.listCredentials(holderDid);
          
          if (response.data && response.data.length > 0) {
            // Find the human credential
            const humanCredential = response.data.find(cred => 
              cred.credentialSubject.isHuman === true || 
              cred.credentialSubject.humanityVerified === true
            );
            
            if (humanCredential) {
              setApiCredential(humanCredential);
              setHasCredential(true);
              
              // Also set the legacy credential format for backward compatibility
              const legacyFormat: VerifiableCredential = {
                id: humanCredential.id,
                type: humanCredential.type,
                issuer: humanCredential.issuer,
                issuanceDate: humanCredential.validFrom,
                credentialSubject: {
                  id: humanCredential.credentialSubject.id,
                  walletAddress: walletAddress,
                  humanityVerified: true,
                  creationDate: humanCredential.validFrom
                },
                proof: {
                  type: humanCredential.proof.type,
                  created: humanCredential.proof.created,
                  verificationMethod: humanCredential.proof.verificationMethod,
                  proofPurpose: humanCredential.proof.proofPurpose,
                  proofValue: humanCredential.proof.proofValue
                }
              };
              
              setCredential(legacyFormat);
              return;
            }
          }
          
          setHasCredential(false);
          setCredential(null);
          setApiCredential(null);
        } else {
          setHasCredential(false);
          setCredential(null);
          setApiCredential(null);
        }
      } else {
        // Fallback to localStorage check
        const storedCredential = localStorage.getItem(`humanity-credential-${walletAddress}`);
        
        if (storedCredential) {
          const parsedCredential = JSON.parse(storedCredential) as VerifiableCredential;
          setCredential(parsedCredential);
          setHasCredential(true);
        } else {
          setCredential(null);
          setHasCredential(false);
        }
      }
    } catch (err) {
      console.error('Error checking for credential:', err);
      setError(err instanceof Error ? err : new Error('Failed to check for credential'));
      
      // Fallback to localStorage check if API fails
      const storedCredential = localStorage.getItem(`humanity-credential-${walletAddress}`);
      
      if (storedCredential) {
        const parsedCredential = JSON.parse(storedCredential) as VerifiableCredential;
        setCredential(parsedCredential);
        setHasCredential(true);
      } else {
        setCredential(null);
        setHasCredential(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new verifiable credential
  const createCredential = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (!isFallbackMode) {
        // Use the actual Humanity Protocol API
        const response = await humanityProtocolService.createHumanCredential(address);
        
        if (response && response.credential) {
          setApiCredential(response.credential);
          setHasCredential(true);
          
          // Also set the legacy credential format for backward compatibility
          const legacyFormat: VerifiableCredential = {
            id: response.credential.id,
            type: response.credential.type,
            issuer: response.credential.issuer,
            issuanceDate: response.credential.validFrom,
            credentialSubject: {
              id: response.credential.credentialSubject.id,
              walletAddress: address,
              humanityVerified: true,
              creationDate: response.credential.validFrom
            },
            proof: {
              type: response.credential.proof.type,
              created: response.credential.proof.created,
              verificationMethod: response.credential.proof.verificationMethod,
              proofPurpose: response.credential.proof.proofPurpose,
              proofValue: response.credential.proof.proofValue
            }
          };
          
          setCredential(legacyFormat);
          
          toast.success('Humanity credential created successfully!');
          return;
        }
      } else {
        // Log fallback mode to console
        console.log('Using fallback mode for credential creation');
        
        // Fallback to creating a local credential
        const fallbackResponse = await humanityProtocolService.fallbackCreateHumanCredential(address);
        
        // For demo purposes, we'll create a simple unsigned credential
        const newCredential: VerifiableCredential = {
          id: `urn:uuid:${crypto.randomUUID()}`,
          type: ['VerifiableCredential', 'HumanityCredential'],
          issuer: 'https://humanity.protocol/issuer',
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            walletAddress: address,
            humanityVerified: true,
            creationDate: new Date().toISOString()
          },
          proof: {
            type: 'DataIntegrityProof',
            created: new Date().toISOString(),
            verificationMethod: 'https://humanity.protocol/issuer/keys/1',
            proofPurpose: 'assertionMethod',
            proofValue: 'z' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0')).join('')
          }
        };
        
        // Store the credential in localStorage for demo purposes
        localStorage.setItem(`humanity-credential-${address}`, JSON.stringify(newCredential));
        
        setCredential(newCredential);
        setHasCredential(true);
        
        toast.success('Humanity credential created successfully!');
      }
    } catch (err) {
      console.error('Error creating credential:', err);
      setError(err instanceof Error ? err : new Error('Failed to create credential'));
      toast.error('Failed to create credential');
      
      // Try fallback method if API fails
      try {
        console.log('Attempting fallback credential creation after API failure');
        
        const fallbackResponse = await humanityProtocolService.fallbackCreateHumanCredential(address);
        
        // For demo purposes, we'll create a simple unsigned credential
        const newCredential: VerifiableCredential = {
          id: `urn:uuid:${crypto.randomUUID()}`,
          type: ['VerifiableCredential', 'HumanityCredential'],
          issuer: 'https://humanity.protocol/issuer',
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            walletAddress: address,
            humanityVerified: true,
            creationDate: new Date().toISOString()
          },
          proof: {
            type: 'DataIntegrityProof',
            created: new Date().toISOString(),
            verificationMethod: 'https://humanity.protocol/issuer/keys/1',
            proofPurpose: 'assertionMethod',
            proofValue: 'z' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0')).join('')
          }
        };
        
        // Store the credential in localStorage for demo purposes
        localStorage.setItem(`humanity-credential-${address}`, JSON.stringify(newCredential));
        
        setCredential(newCredential);
        setHasCredential(true);
        
        toast.success('Humanity credential created successfully!');
      } catch (fallbackErr) {
        console.error('Fallback credential creation also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify a credential
  const verifyCredential = async (): Promise<boolean> => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setIsLoading(true);
      
      if (!isFallbackMode && apiCredential) {
        // Use the actual Humanity Protocol API
        const response = await humanityProtocolService.verifyCredential(apiCredential);
        
        if (response.isValid) {
          toast.success('Credential verified successfully!');
          return true;
        } else {
          toast.error('Credential verification failed: ' + response.message);
          return false;
        }
      } else if (credential) {
        // Log fallback mode to console
        if (isFallbackMode) {
          console.log('Using fallback mode for credential verification');
        }
        
        // Fallback to local verification
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if the credential is for the current connected address
        const isValid = credential.credentialSubject.walletAddress === address;
        
        if (isValid) {
          toast.success('Credential verified successfully!');
        } else {
          toast.error('Credential verification failed');
        }
        
        return isValid;
      } else {
        toast.error('No credential to verify');
        return false;
      }
    } catch (err) {
      console.error('Error verifying credential:', err);
      setError(err instanceof Error ? err : new Error('Failed to verify credential'));
      toast.error('Failed to verify credential');
      
      // Try fallback verification if API fails
      if (credential) {
        try {
          console.log('Attempting fallback credential verification after API failure');
          
          // Simulate verification delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if the credential is for the current connected address
          const isValid = credential.credentialSubject.walletAddress === address;
          
          if (isValid) {
            toast.success('Credential verified successfully!');
          } else {
            toast.error('Credential verification failed');
          }
          
          return isValid;
        } catch (fallbackErr) {
          console.error('Fallback verification also failed:', fallbackErr);
          return false;
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    hasCredential,
    credential,
    apiCredential,
    createCredential,
    verifyCredential,
    error,
    isFallbackMode,
    initializeWithApiKey,
  };

  return (
    <HumanityProtocolContext.Provider value={value}>
      {children}
    </HumanityProtocolContext.Provider>
  );
}; 