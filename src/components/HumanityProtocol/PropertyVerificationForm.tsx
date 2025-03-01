"use client";

import { useState } from 'react';
import { useFlow } from '@/context/FlowContext';
import humanityProtocolService from '@/services/humanityProtocol';
import { IssueCredentialResponse } from '@/services/humanityProtocol';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface PropertyDetails {
  propertyAddress: string;
  currentHeight: number;
  maximumHeight: number;
  availableFloors: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const PropertyVerificationForm = () => {
  const { user } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [credential, setCredential] = useState<IssueCredentialResponse | null>(null);
  
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    propertyAddress: '',
    currentHeight: 0,
    maximumHeight: 0,
    availableFloors: 0,
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'coordinates') {
        setPropertyDetails(prev => ({
          ...prev,
          coordinates: {
            ...prev.coordinates,
            [child]: parseFloat(value) || 0
          }
        }));
      }
    } else {
      setPropertyDetails(prev => ({
        ...prev,
        [name]: name === 'propertyAddress' ? value : parseFloat(value) || 0
      }));
    }
  };

  const handleVerifyProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyDetails.propertyAddress) {
      toast.error('Property address is required');
      return;
    }
    
    setIsLoading(true);
    setVerificationStatus(null);
    setCredential(null);
    
    try {
      // Check if user is logged in
      const userId = user.loggedIn ? user.addr : null;
      if (!userId) {
        toast.error('Please log in to verify property ownership');
        setIsLoading(false);
        return;
      }
      
      // Verify property ownership
      const isVerified = await humanityProtocolService.verifyPropertyOwnership(userId);
      
      if (isVerified) {
        setVerificationStatus('success');
        
        // Issue a new credential
        const credential = await humanityProtocolService.createPropertyOwnershipCredential(
          userId,
          propertyDetails
        );
        
        setCredential(credential);
        toast.success('Property ownership verified successfully!');
      } else {
        setVerificationStatus('failed');
        toast.error('Property ownership verification failed');
      }
    } catch (error) {
      console.error('Error verifying property:', error);
      setVerificationStatus('error');
      toast.error('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleVerifyProperty} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium mb-4">Property Details</h3>
            
            <div>
              <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-300 mb-1">
                Property Address
              </label>
              <input
                type="text"
                id="propertyAddress"
                name="propertyAddress"
                value={propertyDetails.propertyAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, City, State, ZIP"
                required
              />
            </div>
            
            <div>
              <label htmlFor="currentHeight" className="block text-sm font-medium text-gray-300 mb-1">
                Current Building Height (meters)
              </label>
              <input
                type="number"
                id="currentHeight"
                name="currentHeight"
                value={propertyDetails.currentHeight || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Current height in meters"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="maximumHeight" className="block text-sm font-medium text-gray-300 mb-1">
                Maximum Allowed Height (meters)
              </label>
              <input
                type="number"
                id="maximumHeight"
                name="maximumHeight"
                value={propertyDetails.maximumHeight || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum allowed height in meters"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium mb-4">Additional Information</h3>
            
            <div>
              <label htmlFor="availableFloors" className="block text-sm font-medium text-gray-300 mb-1">
                Available Floors for Development
              </label>
              <input
                type="number"
                id="availableFloors"
                name="availableFloors"
                value={propertyDetails.availableFloors || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of floors available"
                min="0"
                step="1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="coordinates.latitude" className="block text-sm font-medium text-gray-300 mb-1">
                Latitude (optional)
              </label>
              <input
                type="number"
                id="coordinates.latitude"
                name="coordinates.latitude"
                value={propertyDetails.coordinates?.latitude || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Latitude coordinate"
                step="0.000001"
              />
            </div>
            
            <div>
              <label htmlFor="coordinates.longitude" className="block text-sm font-medium text-gray-300 mb-1">
                Longitude (optional)
              </label>
              <input
                type="number"
                id="coordinates.longitude"
                name="coordinates.longitude"
                value={propertyDetails.coordinates?.longitude || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Longitude coordinate"
                step="0.000001"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !user.loggedIn}
            className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2 ${
              !user.loggedIn
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : isLoading
                  ? 'bg-blue-600/50 text-blue-200 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-blue-300 border-t-transparent rounded-full"></div>
                Verifying...
              </>
            ) : !user.loggedIn ? (
              <>
                <Icon icon="mdi:account-lock" />
                Connect Wallet to Verify
              </>
            ) : (
              <>
                <Icon icon="mdi:check-decagram" />
                Verify Property Ownership
              </>
            )}
          </button>
        </div>
      </form>
      
      {verificationStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg border ${
            verificationStatus === 'success'
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : verificationStatus === 'failed'
                ? 'bg-red-900/20 border-red-500/30 text-red-400'
                : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-white/10">
              <Icon 
                icon={
                  verificationStatus === 'success'
                    ? 'mdi:check-circle'
                    : verificationStatus === 'failed'
                      ? 'mdi:close-circle'
                      : 'mdi:alert-circle'
                }
                className="text-2xl"
              />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">
                {verificationStatus === 'success'
                  ? 'Verification Successful'
                  : verificationStatus === 'failed'
                    ? 'Verification Failed'
                    : 'Verification Error'}
              </h3>
              <p className="opacity-80 mb-4">
                {verificationStatus === 'success'
                  ? 'Your property ownership has been verified and a credential has been issued.'
                  : verificationStatus === 'failed'
                    ? 'We could not verify your property ownership. Please check your details and try again.'
                    : 'An error occurred during the verification process. Please try again later.'}
              </p>
              
              {verificationStatus === 'success' && credential && (
                <div className="bg-black/20 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Credential Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Credential ID:</span>
                      <span className="font-mono">{credential.credential.id.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issued:</span>
                      <span>{new Date(credential.credential.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid Until:</span>
                      <span>{new Date(credential.credential.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyVerificationForm; 