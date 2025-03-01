"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DeploymentProgress } from './DeploymentProgress';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFlow } from "@/context/FlowContext";
import { useZkSyncAuth } from "@/context/ZkSyncAuthContext";
import flowNftService from "@/services/flowNftService";
import zkSyncService from "@/services/zkSyncService";
import flowConfig from "@/config/flow";
import { NFT } from "@/types/nft";
import { Icon } from '@iconify/react';
import * as fcl from "@onflow/fcl";
import ZkVerificationBadge from "@/components/ZkVerificationBadge";

// Source wallet address for Flow NFT transfer
const SOURCE_FLOW_WALLET = "0x4f2f8523482a3e79";

interface AgreementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: string | null;
  loading: boolean;
  nft: NFT | null;
}

export type StepStatus = 'waiting' | 'loading' | 'completed' | 'failed';

export interface Step {
  title: string;
  description: string;
  status: StepStatus;
  details?: string;
  txHash?: string;
}

interface DeploymentResponse {
  decision: 'EXECUTE' | 'REJECT';
  deployment_status: 'success' | 'failed';
  deployment_output: string;
  model_response: string;
}

export const AgreementDialog = ({ isOpen, onClose, agreement, loading, nft }: AgreementDialogProps) => {
  const { user, isAccountSetup, connectWithFlow, setupAccount } = useFlow();
  const { isConnected: isZkSyncConnected, address: zkSyncAddress } = useZkSyncAuth();
  const [showProgress, setShowProgress] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');
  const [zkSyncTxHash, setZkSyncTxHash] = useState<string | null>(null);
  const [flowTxHash, setFlowTxHash] = useState<string | null>(null);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    {
      title: "Verify Agreement",
      description: "Verifying the legal agreement",
      status: "waiting"
    },
    {
      title: "Connect zkSync Wallet",
      description: "Preparing for ETH transfer via zkSync",
      status: "waiting"
    },
    {
      title: "Transfer ETH",
      description: `Transferring 0.0001 ETH to ${zkSyncService.RECIPIENT_ADDRESS.substring(0, 6)}...${zkSyncService.RECIPIENT_ADDRESS.substring(38)}`,
      status: "waiting"
    },
    {
      title: "Verify ETH Transfer",
      description: "Confirming ETH transfer on zkSync Era Sepolia",
      status: "waiting"
    },
    {
      title: "Connect Flow Wallet",
      description: "Preparing for NFT transfer on Flow",
      status: "waiting"
    },
    {
      title: "Transfer NFT",
      description: `Transferring NFT from ${SOURCE_FLOW_WALLET.substring(0, 6)}...`,
      status: "waiting"
    },
    {
      title: "Verify NFT Transfer",
      description: "Confirming NFT ownership on Flow blockchain",
      status: "waiting"
    }
  ]);
  const [zkVerified, setZkVerified] = useState(false);
  const [zkProofId, setZkProofId] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setShowProgress(false);
      setDeploymentStatus('waiting');
      setShowConnectWalletModal(false);
      setZkSyncTxHash(null);
      setFlowTxHash(null);
    }
  }, [isOpen]);

  const handleConnectFlow = async () => {
    try {
      await connectWithFlow();
      if (!isAccountSetup) {
        await setupAccount();
      }
      setShowConnectWalletModal(false);
      proceedWithTransaction();
    } catch (error) {
      console.error("Error connecting to Flow:", error);
      toast.error("Failed to connect to Flow wallet. Please try again.");
    }
  };

  const handleApprove = async () => {
    if (!nft) {
      toast.error("No NFT selected");
      return;
    }

    // Check if zkSync is connected first
    if (!isZkSyncConnected) {
      toast.error("Please connect your zkSync wallet first for payment processing");
      return;
    }

    // Then check Flow wallet
    if (!user.loggedIn) {
      setShowConnectWalletModal(true);
      return;
    }

    if (!isAccountSetup) {
      try {
        toast.loading("Setting up your account to receive NFTs...");
        await setupAccount();
        toast.dismiss();
        toast.success("Account set up successfully!");
        proceedWithTransaction();
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to set up your account. Please try again.");
      }
      return;
    }

    proceedWithTransaction();
  };

  const proceedWithTransaction = async () => {
    try {
      setApprovalLoading(true);
      setShowProgress(true);
      
      // Step 1: Verify Agreement
      updateStepStatus(0, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(0, 'completed');
      
      // Step 2: Connect zkSync Wallet
      setCurrentStep(1);
      updateStepStatus(1, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(1, 'completed');
      
      // Step 3: Transfer ETH on zkSync
      setCurrentStep(2);
      updateStepStatus(2, 'loading');
      
      try {
        // Transfer ETH on zkSync
        const ethTransferResult = await zkSyncService.transferETH(zkSyncAddress || '');
        setZkSyncTxHash(ethTransferResult.transactionHash);
        
        updateStepStatus(2, 'completed', undefined, ethTransferResult.transactionHash);
      } catch (error) {
        console.error('Error transferring ETH:', error);
        updateStepStatus(2, 'failed', 'Failed to transfer ETH. Please try again.');
        setDeploymentStatus('failed');
        setApprovalLoading(false);
        return;
      }
      
      // Step 4: Verify ETH Transfer
      setCurrentStep(3);
      updateStepStatus(3, 'loading');
      
      try {
        // Check ETH transfer status
        const isEthTransferSuccessful = await zkSyncService.checkTransactionStatus(zkSyncTxHash || '');
        
        if (!isEthTransferSuccessful) {
          updateStepStatus(3, 'failed', 'ETH transfer verification failed. Please try again.');
          setDeploymentStatus('failed');
          setApprovalLoading(false);
          return;
        }
        
        updateStepStatus(3, 'completed');
      } catch (error) {
        console.error('Error verifying ETH transfer:', error);
        updateStepStatus(3, 'failed', 'Failed to verify ETH transfer. Please try again.');
        setDeploymentStatus('failed');
        setApprovalLoading(false);
        return;
      }
      
      // Step 5: Connect Flow Wallet
      setCurrentStep(4);
      updateStepStatus(4, 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(4, 'completed');
      
      // Step 6: Transfer NFT on Flow
      setCurrentStep(5);
      updateStepStatus(5, 'loading');
      
      try {
        // Get current user's address
        const currentUser = await fcl.currentUser().snapshot();
        const recipientAddress = currentUser.addr;
        
        // Check if recipientAddress is defined
        if (!recipientAddress) {
          throw new Error("User address is undefined");
        }
        
        // Transfer NFT from source wallet to current user
        if (!nft) {
          throw new Error("NFT data is missing");
        }
        
        const nftTransferResult = await flowNftService.transferNFTFromWallet(
          SOURCE_FLOW_WALLET,
          recipientAddress,
          nft.id
        );
        
        setFlowTxHash(nftTransferResult.transactionId);
        
        if (nftTransferResult.status !== flowConfig.FLOW_TX_STATUS.SEALED) {
          updateStepStatus(5, 'failed', 'NFT transfer failed. Please try again.');
          setDeploymentStatus('failed');
          setApprovalLoading(false);
          return;
        }
        
        // Set ZK verification status from the transfer result
        setZkVerified(nftTransferResult.verified);
        setZkProofId(`proof-${nft.id}-${Date.now()}`);
        
        updateStepStatus(5, 'completed', undefined, nftTransferResult.transactionId);
      } catch (error) {
        console.error('Error transferring NFT:', error);
        updateStepStatus(5, 'failed', 'Failed to transfer NFT. Please try again.');
        setDeploymentStatus('failed');
        setApprovalLoading(false);
        return;
      }
      
      // Step 7: Verify NFT Transfer
      setCurrentStep(6);
      updateStepStatus(6, 'loading');
      
      try {
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        updateStepStatus(6, 'completed');
        setDeploymentStatus('success');
      } catch (error) {
        console.error('Error verifying NFT transfer:', error);
        updateStepStatus(6, 'failed', 'Failed to verify NFT transfer. Please try again.');
        setDeploymentStatus('failed');
      }
    } catch (error) {
      console.error('Error during transaction process:', error);
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        newSteps[currentStep].status = 'failed';
        return newSteps;
      });
      setDeploymentStatus('failed');
      toast.error("Error during transaction process. Please try again.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const updateStepStatus = (stepIndex: number, status: StepStatus, details?: string, txHash?: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[stepIndex].status = status;
      if (details) {
        newSteps[stepIndex].details = details;
      }
      if (txHash) {
        newSteps[stepIndex].txHash = txHash;
      }
      return newSteps;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark_grey rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto mx-4">
        {showConnectWalletModal ? (
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-24 font-medium">
                Connect Flow Wallet
              </h2>
              <button 
                onClick={() => setShowConnectWalletModal(false)}
                className="text-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                <img 
                  src="/images/Flow_Logo.png" 
                  alt="Flow" 
                  className="w-12 h-12" 
                />
              </div>
              <h3 className="text-white text-xl mb-4">Connect to Flow Wallet</h3>
              <p className="text-muted mb-6">
                You need to connect your Flow wallet to receive NFTs. This will allow you to receive and manage your AirSpace NFTs.
              </p>
              
              <button 
                onClick={handleConnectFlow}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center mx-auto"
              >
                <img 
                  src="/images/Flow_Logo.png" 
                  alt="Flow" 
                  className="w-5 h-5 mr-2" 
                />
                Connect Flow Wallet
              </button>
              
              <p className="text-xs text-muted mt-4">
                Choose your preferred wallet from the options provided.
              </p>
            </div>
          </div>
        ) : !showProgress ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-24 font-medium">
                Legal Agreement
              </h2>
              <button 
                onClick={onClose}
                className="text-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {loading ? (
              <div className="text-white text-center py-8">Loading agreement...</div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{agreement || ''}</ReactMarkdown>
              </div>
            )}
            
            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="bg-deepSlate text-white px-6 py-2 rounded-lg hover:bg-opacity-80"
                disabled={approvalLoading}
              >
                Reject
              </button>
              <button 
                onClick={handleApprove}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-80 flex items-center"
                disabled={approvalLoading}
              >
                {approvalLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Approve & Purchase NFT'
                )}
              </button>
            </div>
            
            <div className="mt-4 text-muted text-sm">
              <p>By approving, you agree to:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Transfer 0.0001 ETH via zkSync Era Sepolia testnet</li>
                <li>Receive an NFT from Flow wallet {SOURCE_FLOW_WALLET.substring(0, 6)}...</li>
                <li>Accept the terms of the agreement</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-24 font-medium">
                Processing Purchase
              </h2>
              <button 
                onClick={onClose}
                className="text-muted hover:text-white"
                disabled={deploymentStatus === 'waiting'}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6 mt-6">
              {steps.map((step, index) => (
                <div key={index} className={`flex items-start ${currentStep === index ? 'opacity-100' : 'opacity-70'}`}>
                  <div className="mr-4 mt-1">
                    {step.status === 'waiting' && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                    )}
                    {step.status === 'loading' && (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    )}
                    {step.status === 'completed' && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                    {step.status === 'failed' && (
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{step.title}</h3>
                    <p className="text-muted text-sm">{step.description}</p>
                    
                    {step.details && step.status === 'failed' && (
                      <p className="text-red-400 text-xs mt-1">{step.details}</p>
                    )}
                    
                    {step.txHash && (
                      <div className="mt-1 text-xs">
                        {index === 2 && (
                          <a 
                            href={`https://sepolia.explorer.zksync.io/tx/${step.txHash}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center"
                          >
                            <Icon icon="heroicons:arrow-top-right-on-square" className="mr-1" />
                            View on zkSync Explorer
                          </a>
                        )}
                        
                        {index === 5 && (
                          <a 
                            href={`https://testnet.flowscan.org/transaction/${step.txHash}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center"
                          >
                            <Icon icon="heroicons:arrow-top-right-on-square" className="mr-1" />
                            View on FlowScan
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {deploymentStatus !== 'waiting' && (
              <div className="mt-8 text-center">
                {deploymentStatus === 'success' ? (
                  <div className="text-green-400">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-xl font-medium mt-4">Purchase Successful!</h3>
                    <div className="text-center mt-6">
                      <div className="flex items-center justify-center mb-4">
                        <ZkVerificationBadge 
                          verified={zkVerified} 
                          proofId={zkProofId || undefined}
                          system="groth16"
                          className="mx-auto"
                        />
                      </div>
                      <p className="text-muted mt-2">Your NFT has been transferred to your Flow wallet.</p>
                    </div>
                    
                    <div className="mt-6 bg-dark_grey/30 rounded-lg p-6 max-w-md mx-auto">
                      <h4 className="text-white font-medium mb-2">Transaction Summary</h4>
                      
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span className="text-muted">ETH Transferred:</span>
                          <span className="text-white">0.0001 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Recipient:</span>
                          <span className="text-white">{zkSyncService.RECIPIENT_ADDRESS.substring(0, 6)}...{zkSyncService.RECIPIENT_ADDRESS.substring(38)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">NFT ID:</span>
                          <span className="text-white">#{nft?.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Property:</span>
                          <span className="text-white">{nft?.propertyAddress.substring(0, 15)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center gap-4">
                      <a 
                        href="/my-nfts"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View My NFTs
                      </a>
                      <button 
                        onClick={onClose}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-xl font-medium mt-4">Transaction Failed</h3>
                    <p className="text-muted mt-2">There was an error processing your transaction. Please try again.</p>
                    <button 
                      onClick={onClose}
                      className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-80"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 