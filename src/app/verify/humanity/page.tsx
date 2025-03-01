"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import PropertyVerificationForm from '@/components/HumanityProtocol/PropertyVerificationForm';
import CredentialsList from '@/components/HumanityProtocol/CredentialsList';

const HumanityProtocolPage = () => {
  const [activeTab, setActiveTab] = useState<'verify' | 'credentials'>('verify');

  return (
    <div className="container mx-auto px-4 pt-36 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Humanity Protocol Verification</h1>
          <p className="text-gray-400 mb-6">
            Verify your property ownership using Humanity Protocol's verifiable credentials.
            This secure and privacy-preserving process creates a cryptographic proof of your ownership
            that can be used throughout the AirSpace platform.
          </p>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <Icon icon="heroicons:information-circle" className="text-blue-500 mt-1 mr-3 text-xl flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-400 mb-1">How It Works</h3>
                <p className="text-gray-400 text-sm">
                  Humanity Protocol issues verifiable credentials that cryptographically prove your property ownership.
                  These credentials are stored in your wallet and can be presented when listing air rights or
                  completing transactions, without revealing sensitive information.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex border-b border-gray-700 mb-8">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'verify' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Property
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'credentials' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('credentials')}
          >
            My Credentials
          </button>
        </div>
        
        {activeTab === 'verify' ? (
          <PropertyVerificationForm />
        ) : (
          <CredentialsList />
        )}
        
        {activeTab === 'verify' && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            
            <div className="border border-gray-700 rounded-lg p-5">
              <h3 className="font-medium text-lg mb-2">What is a verifiable credential?</h3>
              <p className="text-gray-400">
                A verifiable credential is a tamper-evident credential that has authorship that can be cryptographically verified.
                It follows the W3C Verifiable Credentials Data Model and allows for secure, private verification of claims.
              </p>
            </div>
            
            <div className="border border-gray-700 rounded-lg p-5">
              <h3 className="font-medium text-lg mb-2">How is my privacy protected?</h3>
              <p className="text-gray-400">
                Humanity Protocol uses advanced cryptography to ensure that only the minimum necessary information is shared.
                Your sensitive property documents remain private, while still allowing others to verify your ownership claims.
              </p>
            </div>
            
            <div className="border border-gray-700 rounded-lg p-5">
              <h3 className="font-medium text-lg mb-2">How long are credentials valid?</h3>
              <p className="text-gray-400">
                By default, credentials are valid for one year from the date of issuance. After expiration, you can
                easily renew your credentials through this same verification process.
              </p>
            </div>
            
            <div className="border border-gray-700 rounded-lg p-5">
              <h3 className="font-medium text-lg mb-2">Can I revoke my credentials?</h3>
              <p className="text-gray-400">
                Yes, you can revoke your credentials at any time if you no longer wish to share this information
                or if your property details have changed. Revocation is immediate and permanent.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanityProtocolPage; 