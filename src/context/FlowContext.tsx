"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as fcl from "@onflow/fcl";
import flowConfig from '@/config/flow';
import { toast } from 'react-hot-toast';

// Configure FCL to use standard wallet discovery
fcl.config()
  // Set network
  .put("flow.network", flowConfig.NETWORK)
  // Access node API
  .put("accessNode.api", flowConfig.FLOW_ACCESS_NODE)
  // Use standard wallet discovery
  .put("discovery.wallet", flowConfig.FLOW_WALLET_DISCOVERY)
  // App details
  .put("app.detail.title", flowConfig.APP_NAME)
  .put("app.detail.icon", flowConfig.APP_ICON)
  .put("app.detail.description", flowConfig.APP_DESCRIPTION)
  // Contract addresses
  .put("0xFlowToken", flowConfig.FLOW_TOKEN_ADDRESS)
  .put("0xNonFungibleToken", flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS)
  .put("0xMetadataViews", flowConfig.METADATA_VIEWS_ADDRESS)
  .put("0xAirSpaceNFT", flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS);

// Define the shape of our context
interface FlowUser {
  addr: string | null;
  loggedIn: boolean;
  cid: string | null;
  expiresAt: number | null;
}

interface FlowContextType {
  user: FlowUser;
  isLoading: boolean;
  error: Error | null;
  connectWithFlow: () => Promise<void>;
  disconnectFromFlow: () => Promise<void>;
  setupAccount: () => Promise<void>;
  isAccountSetup: boolean;
  checkingAccountSetup: boolean;
}

// Create the context with a default value
const FlowContext = createContext<FlowContextType>({
  user: { addr: null, loggedIn: false, cid: null, expiresAt: null },
  isLoading: false,
  error: null,
  connectWithFlow: async () => {},
  disconnectFromFlow: async () => {},
  setupAccount: async () => {},
  isAccountSetup: false,
  checkingAccountSetup: false,
});

// Create a hook to use the context
export const useFlow = () => useContext(FlowContext);

interface FlowProviderProps {
  children: ReactNode;
}

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FlowUser>({ addr: null, loggedIn: false, cid: null, expiresAt: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAccountSetup, setIsAccountSetup] = useState<boolean>(false);
  const [checkingAccountSetup, setCheckingAccountSetup] = useState<boolean>(false);

  // Subscribe to user changes
  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  // Check if the user's account is set up to receive NFTs
  useEffect(() => {
    const checkAccountSetup = async () => {
      if (user.addr && user.loggedIn) {
        setCheckingAccountSetup(true);
        try {
          const isSetup = await isAccountSetupForNFTs(user.addr);
          setIsAccountSetup(isSetup);
        } catch (err) {
          console.error("Error checking account setup:", err);
          setIsAccountSetup(false);
        } finally {
          setCheckingAccountSetup(false);
        }
      } else {
        setIsAccountSetup(false);
      }
    };

    checkAccountSetup();
  }, [user.addr, user.loggedIn]);

  // Function to check if an account is set up to receive NFTs
  const isAccountSetupForNFTs = async (address: string): Promise<boolean> => {
    try {
      const result = await fcl.query({
        cadence: `
          import AirSpaceNFT from ${flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS}
          
          pub fun main(address: Address): Bool {
            let account = getAccount(address)
            
            return account.getCapability<&{NonFungibleToken.CollectionPublic}>(AirSpaceNFT.CollectionPublicPath).check()
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      });
      
      return result;
    } catch (error) {
      console.error("Error checking if account is set up:", error);
      return false;
    }
  };

  // Function to connect with Flow
  const connectWithFlow = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("FCL Config:", fcl.config());
      console.log("Initiating Flow authentication with wallet discovery...");
      
      // Authenticate with FCL using standard wallet discovery
      const user = await fcl.authenticate({
        appIdentifier: flowConfig.APP_NAME,
        servicePingTimeout: 15000, // Increase timeout for better reliability
        showModal: true // This will open the wallet discovery modal
      });
      
      console.log("Flow authentication response:", user);
      
      if (user.loggedIn) {
        toast.success(`Connected to Flow as ${user.addr}`);
      } else {
        throw new Error("Failed to connect to Flow");
      }
    } catch (err) {
      console.error("Error connecting to Flow:", err);
      setError(err instanceof Error ? err : new Error("Unknown error connecting to Flow"));
      toast.error("Failed to connect to Flow");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to disconnect from Flow
  const disconnectFromFlow = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await fcl.unauthenticate();
      toast.success("Disconnected from Flow");
    } catch (err) {
      console.error("Error disconnecting from Flow:", err);
      setError(err instanceof Error ? err : new Error("Unknown error disconnecting from Flow"));
      toast.error("Failed to disconnect from Flow");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set up an account to receive NFTs
  const setupAccount = async (): Promise<void> => {
    if (!user.addr || !user.loggedIn) {
      toast.error("Please connect to Flow first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const transactionId = await fcl.mutate({
        cadence: `
          import NonFungibleToken from ${flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS}
          import MetadataViews from ${flowConfig.METADATA_VIEWS_ADDRESS}
          import AirSpaceNFT from ${flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS}
          
          transaction {
            prepare(signer: AuthAccount) {
              // Check if the account already has a collection
              if signer.borrow<&AirSpaceNFT.Collection>(from: AirSpaceNFT.CollectionStoragePath) == nil {
                // Create a new empty collection
                let collection <- AirSpaceNFT.createEmptyCollection()
                
                // Save it to the account
                signer.save(<-collection, to: AirSpaceNFT.CollectionStoragePath)
          
                // Create a public capability for the collection
                signer.link<&AirSpaceNFT.Collection{NonFungibleToken.CollectionPublic, AirSpaceNFT.AirSpaceNFTCollectionPublic, MetadataViews.ResolverCollection}>(
                  AirSpaceNFT.CollectionPublicPath,
                  target: AirSpaceNFT.CollectionStoragePath
                )
              }
            }
          }
        `,
        args: (arg: any, t: any) => [],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: flowConfig.DEFAULT_GAS_LIMIT
      });
      
      toast.success("Setting up your account...");
      
      const transaction = await fcl.tx(transactionId).onceSealed();
      
      if (transaction.status === flowConfig.FLOW_TX_STATUS.SEALED) {
        setIsAccountSetup(true);
        toast.success("Your account is now set up to receive NFTs");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Error setting up account:", err);
      setError(err instanceof Error ? err : new Error("Unknown error setting up account"));
      toast.error("Failed to set up your account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FlowContext.Provider
      value={{
        user,
        isLoading,
        error,
        connectWithFlow,
        disconnectFromFlow,
        setupAccount,
        isAccountSetup,
        checkingAccountSetup,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export default FlowContext; 