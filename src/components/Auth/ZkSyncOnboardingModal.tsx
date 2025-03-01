"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useZkSyncAuth } from '@/context/ZkSyncAuthContext';
import { toast } from 'react-hot-toast';

interface ZkSyncOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZkSyncOnboardingModal: React.FC<ZkSyncOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { connectWithZkSync, isConnecting, error } = useZkSyncAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowTroubleshooting(false);
    }
  }, [isOpen]);
  
  // Monitor for errors to show troubleshooting
  useEffect(() => {
    if (error && isOpen) {
      setShowTroubleshooting(true);
    }
  }, [error, isOpen]);
  
  const steps = [
    {
      title: "Welcome to zkSync SSO",
      description: "Experience the future of Web3 authentication with zkSync's Single Sign-On",
      image: "/images/zksync-logo.svg",
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            zkSync SSO provides a seamless, secure way to connect to Web3 applications without the complexity of seed phrases or private keys.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-white">Enhanced Security</h4>
              </div>
              <p className="text-white/70 text-sm">
                Secured by passkeys, eliminating the risks of seed phrase theft or loss
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 12l-4 4-4-4"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-white">Simplified Experience</h4>
              </div>
              <p className="text-white/70 text-sm">
                Web2-like login experience with the benefits of blockchain technology
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How It Works",
      description: "Simple, secure authentication in just a few steps",
      image: "/images/zksync-logo.svg",
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
              1
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Create a Passkey</h4>
              <p className="text-white/70 text-sm">
                Generate a secure passkey using your device's biometric authentication (FaceID, TouchID) or PIN
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
              2
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Authorize Connection</h4>
              <p className="text-white/70 text-sm">
                Review and approve the connection request to AirSpace
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1">
              3
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Start Using AirSpace</h4>
              <p className="text-white/70 text-sm">
                Once connected, you'll have full access to AirSpace's features on zkSync Era
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Connect?",
      description: "Connect with zkSync SSO to get started",
      image: "/images/zksync-logo.svg",
      content: (
        <div className="space-y-4 text-center">
          <div className="w-24 h-24 mx-auto">
            <motion.img 
              src="/images/zksync-logo.svg" 
              alt="zkSync Logo" 
              className="w-full h-full"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </div>
          <p className="text-white/80 max-w-md mx-auto">
            You're about to experience the future of Web3 authentication. 
            Click the button below to connect with zkSync SSO and start your journey.
          </p>
          <div className="text-white/60 text-sm mt-4">
            <p>When prompted, please approve the connection request in the popup window.</p>
            <p>Make sure your browser allows popups for this site.</p>
          </div>
        </div>
      )
    }
  ];

  const troubleshootingContent = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Connection Troubleshooting</h3>
      
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-white/80 mb-2">
          {error ? `Error: ${error.message}` : 'Connection failed. Please try again.'}
        </p>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-white">Try these steps:</h4>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm">
            1
          </div>
          <p className="text-white/70 text-sm">
            Make sure popups are allowed for this site in your browser settings
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm">
            2
          </div>
          <p className="text-white/70 text-sm">
            Try using a different browser (Chrome or Firefox recommended)
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm">
            3
          </div>
          <p className="text-white/70 text-sm">
            Clear your browser cache and cookies, then restart your browser
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm">
            4
          </div>
          <p className="text-white/70 text-sm">
            Disable any browser extensions that might be interfering with the connection
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => {
            setShowTroubleshooting(false);
            setCurrentStep(2); // Go back to the connect step
          }}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          Go back and try again
        </button>
      </div>
    </div>
  );

  const handleConnect = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Initiating zkSync SSO connection...', {
        id: 'zksync-connecting-loading'
      });
      
      // Close the modal
      onClose();
      
      // Attempt to connect
      await connectWithZkSync();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error('Failed to connect. Please try again.', {
        id: 'modal-connect-error'
      });
      console.error(err);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-darkmode border border-dark_border rounded-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with progress indicator */}
            <div className="relative p-6 border-b border-dark_border">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <motion.img 
                  src={showTroubleshooting ? "/images/zksync-logo.svg" : steps[currentStep].image} 
                  alt="zkSync" 
                  className="w-10 h-10"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {showTroubleshooting ? "Connection Troubleshooting" : steps[currentStep].title}
                  </h3>
                  <p className="text-white/60">
                    {showTroubleshooting ? "Let's solve the connection issue" : steps[currentStep].description}
                  </p>
                </div>
              </div>
              
              {!showTroubleshooting && (
                <div className="flex gap-1 mt-4">
                  {steps.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-1 rounded-full flex-1 ${index === currentStep ? 'bg-primary' : 'bg-dark_border'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showTroubleshooting ? 'troubleshooting' : currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {showTroubleshooting ? troubleshootingContent : steps[currentStep].content}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Footer with navigation buttons */}
            <div className="p-6 border-t border-dark_border flex justify-between">
              {showTroubleshooting ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-dark_border text-white hover:bg-dark_border"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowTroubleshooting(false);
                      handleConnect();
                    }}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={prevStep}
                    className={`px-4 py-2 rounded-lg border border-dark_border text-white ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark_border'}`}
                    disabled={currentStep === 0}
                  >
                    Back
                  </button>
                  
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </>
                      ) : (
                        'Connect with zkSync'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZkSyncOnboardingModal; 