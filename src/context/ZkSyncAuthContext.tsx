"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { zksyncSsoConnector } from 'zksync-sso/connector';
import { zksyncSepoliaTestnet } from 'viem/chains';
import { createConfig, connect, disconnect, getAccount } from '@wagmi/core';
import { parseEther, createPublicClient, http } from 'viem';
import { toast } from 'react-hot-toast';

// Define the shape of our context
interface ZkSyncAuthContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | undefined;
  connectWithZkSync: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  error: Error | null;
  isNewWallet: boolean;
}

// Create the context with a default value
const ZkSyncAuthContext = createContext<ZkSyncAuthContextType>({
  isConnected: false,
  isConnecting: false,
  address: undefined,
  connectWithZkSync: async () => {},
  disconnectWallet: async () => {},
  error: null,
  isNewWallet: false,
});

// Create a hook to use the context
export const useZkSyncAuth = () => useContext(ZkSyncAuthContext);

interface ZkSyncAuthProviderProps {
  children: ReactNode;
  onNewWalletConnected?: (address: string) => Promise<void>;
}

// Helper function to clear all session data
const clearAllSessionData = () => {
  if (typeof window !== 'undefined') {
    // Clear all localStorage items related to authentication
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('wagmi') || 
        key.includes('zksync') || 
        key.includes('wallet') ||
        key.includes('passkey') ||
        key.includes('auth') ||
        key.includes('session') ||
        key.includes('connect')
      ) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear specific known items
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.account');
    localStorage.removeItem('wagmi.chainId');
    
    // Clear any session storage items as well
    Object.keys(sessionStorage).forEach(key => {
      if (
        key.startsWith('wagmi') || 
        key.includes('zksync') || 
        key.includes('wallet') ||
        key.includes('passkey') ||
        key.includes('auth') ||
        key.includes('session') ||
        key.includes('connect')
      ) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear cookies related to authentication
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (
        name.includes('zksync') || 
        name.includes('wagmi') || 
        name.includes('wallet') ||
        name.includes('passkey') ||
        name.includes('auth') ||
        name.includes('session')
      ) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
};

export const ZkSyncAuthProvider: React.FC<ZkSyncAuthProviderProps> = ({ 
  children, 
  onNewWalletConnected 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [ssoConnector, setSsoConnector] = useState<any>(null);
  const [isNewWallet, setIsNewWallet] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastErrorTimestamp, setLastErrorTimestamp] = useState<number>(0);

  // Initialize the connector and config
  useEffect(() => {
    // Configure zkSync SSO connector with simplified session config
    const connector = zksyncSsoConnector({
      // Session configuration - simplified for MVP
      session: {
        expiry: "1 day",
        feeLimit: parseEther("0.1"),
      },
      // Removed timeout property to fix linter error
    });

    // Create public client
    const publicClient = createPublicClient({
      chain: zksyncSepoliaTestnet,
      transport: http(),
    });

    // Create wagmi config
    const config = createConfig({
      connectors: [connector],
      chains: [zksyncSepoliaTestnet],
      client: ({ chain }) => publicClient,
    });

    setSsoConnector(connector);
    setWagmiConfig(config);
    
    // Clear all session data on mount
    clearAllSessionData();
    
    // Force disconnect on mount
    disconnect(config).catch(console.error);
    
    return () => {
      // Clean up on unmount
      disconnect(config).catch(console.error);
      clearAllSessionData();
    };
  }, []);

  // Check if this is a new wallet connection
  const checkIfNewWallet = (walletAddress: string) => {
    if (typeof window !== 'undefined') {
      const knownWallets = localStorage.getItem('zksync-known-wallets');
      const walletArray = knownWallets ? JSON.parse(knownWallets) as string[] : [];
      
      if (!walletArray.includes(walletAddress)) {
        // This is a new wallet
        walletArray.push(walletAddress);
        localStorage.setItem('zksync-known-wallets', JSON.stringify(walletArray));
        return true;
      }
      
      return false;
    }
    
    return false;
  };

  // Helper function to set error with rate limiting
  const setErrorWithRateLimit = (newError: Error) => {
    const now = Date.now();
    // Only set a new error if it's been at least 2 seconds since the last one
    // This prevents rapid error state changes that could cause infinite loops
    if (now - lastErrorTimestamp > 2000) {
      setError(newError);
      setLastErrorTimestamp(now);
    } else {
      // Just log the error if we're rate limiting
      console.warn('Rate limited error:', newError.message);
    }
  };

  // Connect with zkSync SSO
  const connectWithZkSync = async () => {
    if (!wagmiConfig || !ssoConnector) return;
    
    try {
      // First disconnect and clear all session data
      await disconnect(wagmiConfig);
      clearAllSessionData();
      
      setIsConnected(false);
      setAddress(undefined);
      setIsConnecting(true);
      setError(null);
      setIsNewWallet(false);
      
      // Add a small delay to ensure all previous session data is cleared
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Increment connection attempts
      setConnectionAttempts(prev => prev + 1);
      
      // Log connection attempt for debugging
      console.log(`Attempting to connect with zkSync SSO (attempt ${connectionAttempts + 1})`);
      
      // Create a unique timestamp to force a new connector instance
      const timestamp = Date.now();
      
      // Recreate the connector to ensure a fresh authentication flow
      const freshConnector = zksyncSsoConnector({
        session: {
          expiry: "1 day",
          feeLimit: parseEther("0.1"),
        },
        // Removed timeout property to fix linter error
      });
      
      // Update the connector in state
      setSsoConnector(freshConnector);
      
      // Create a fresh config with the new connector
      const freshConfig = createConfig({
        connectors: [freshConnector],
        chains: [zksyncSepoliaTestnet],
        client: ({ chain }) => createPublicClient({
          chain: zksyncSepoliaTestnet,
          transport: http(),
        }),
      });
      
      // Update the config in state
      setWagmiConfig(freshConfig);
      
      // Connect with the fresh connector with a timeout
      const connectPromise = connect(freshConfig, {
        connector: freshConnector,
        chainId: zksyncSepoliaTestnet.id,
      });
      
      // Add a timeout to the connection attempt
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 60000);
      });
      
      // Race the connection promise against the timeout
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Get account information
      const account = getAccount(freshConfig);
      
      // Log connection result for debugging
      console.log('zkSync SSO connection result:', account);
      
      setIsConnected(account.isConnected);
      setAddress(account.address);
      
      // Check if this is a new wallet connection
      if (account.address) {
        const isNew = checkIfNewWallet(account.address);
        setIsNewWallet(isNew);
        
        // If this is a new wallet and we have a callback, call it
        if (isNew && onNewWalletConnected) {
          await onNewWalletConnected(account.address);
          
          // Show a toast notification about the new wallet
          toast.success('New wallet detected! A Humanity Protocol credential will be created for you.', {
            id: 'new-wallet-detected',
          });
        }
        
        // Show success toast
        toast.success('Successfully connected to zkSync', {
          id: 'connect-success',
        });
      } else {
        // If we don't have an address but isConnected is true, something is wrong
        if (account.isConnected) {
          console.warn('Connected but no address available');
          toast.error('Connected but no address available. Please try again.', {
            id: 'connect-no-address',
          });
        }
      }
    } catch (err) {
      console.error('Failed to connect with zkSync SSO:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        // Check for user rejection
        if (err.message.includes('rejected') || err.message.includes('Rejected')) {
          setErrorWithRateLimit(new Error('User rejected the request. Please try again and approve the connection.'));
          toast.error('Connection rejected. Please try again and approve the connection.', {
            id: 'connect-rejected',
          });
        } 
        // Check for timeout
        else if (err.message.includes('timeout')) {
          setErrorWithRateLimit(new Error('Connection timed out. Please check your network and try again.'));
          toast.error('Connection timed out. Please check your network and try again.', {
            id: 'connect-timeout',
          });
        }
        // Other errors
        else {
          setErrorWithRateLimit(err);
          toast.error(`Failed to connect: ${err.message}`, {
            id: `connect-error-${err.message.substring(0, 20)}`,
          });
        }
      } else {
        setErrorWithRateLimit(new Error('Failed to connect with zkSync SSO'));
        toast.error('Failed to connect with zkSync SSO', {
          id: 'connect-unknown-error',
        });
      }
      
      // If we've tried multiple times, suggest clearing browser cache
      if (connectionAttempts >= 2) {
        toast.error('Multiple connection failures. Try clearing your browser cache and cookies, then restart your browser.', {
          id: 'multiple-failures',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (!wagmiConfig) return;
    
    try {
      await disconnect(wagmiConfig);
      setIsConnected(false);
      setAddress(undefined);
      setIsNewWallet(false);
      
      // Clear all session data
      clearAllSessionData();

      // Reset connection attempts
      setConnectionAttempts(0);
      
      toast.success('Disconnected successfully', {
        id: 'disconnect-success',
      });
    } catch (err) {
      console.error('Failed to disconnect:', err);
      toast.error('Failed to disconnect', {
        id: 'disconnect-error',
      });
    }
  };

  // Check connection status on mount
  useEffect(() => {
    if (!wagmiConfig) return;
    
    // Clear all session data on mount
    clearAllSessionData();
    
    // Force disconnect on mount
    disconnect(wagmiConfig).catch(console.error);
  }, [wagmiConfig]);

  const value = {
    isConnected,
    isConnecting,
    address,
    connectWithZkSync,
    disconnectWallet,
    error,
    isNewWallet,
  };

  return (
    <ZkSyncAuthContext.Provider value={value}>
      {children}
    </ZkSyncAuthContext.Provider>
  );
}; 