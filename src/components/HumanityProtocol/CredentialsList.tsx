"use client";

import { useState, useEffect } from 'react';
import { useFlow } from '@/context/FlowContext';
import humanityProtocolService from '@/services/humanityProtocol';
import { VerifiableCredential } from '@/services/humanityProtocol';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const CredentialsList = () => {
  const { user } = useFlow();
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      fetchCredentials();
    }
  }, [user.loggedIn, user.addr]);

  const fetchCredentials = async () => {
    if (!user.addr) return;
    
    setIsLoading(true);
    try {
      const response = await humanityProtocolService.listCredentials(
        humanityProtocolService.addressToDid(user.addr)
      );
      setCredentials(response.credentials || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeCredential = async (credentialId: string) => {
    try {
      await humanityProtocolService.revokeCredential(credentialId);
      toast.success('Credential revoked successfully');
      fetchCredentials(); // Refresh the list
    } catch (error) {
      console.error('Error revoking credential:', error);
      toast.error('Failed to revoke credential');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCredentialTypeIcon = (type: string[]) => {
    if (type.includes('PropertyOwnership')) return 'mdi:home';
    if (type.includes('AirRights')) return 'mdi:arrow-up-bold-box';
    if (type.includes('Identity')) return 'mdi:account-check';
    if (type.includes('Developer')) return 'mdi:developer-board';
    return 'mdi:certificate';
  };

  const getCredentialColor = (type: string[]) => {
    if (type.includes('PropertyOwnership')) return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    if (type.includes('AirRights')) return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    if (type.includes('Identity')) return 'bg-green-500/10 border-green-500/30 text-green-400';
    if (type.includes('Developer')) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
  };

  if (!user.loggedIn) {
    return (
      <div className="text-center p-8 border border-gray-700 rounded-lg">
        <Icon icon="mdi:account-lock" className="text-4xl text-gray-400 mb-3" />
        <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Please connect your wallet to view your credentials</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Verifiable Credentials</h2>
        <button
          onClick={fetchCredentials}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
        >
          <Icon icon="mdi:refresh" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center p-8 border border-gray-700 rounded-lg">
          <Icon icon="mdi:certificate-outline" className="text-4xl text-gray-400 mb-3" />
          <h3 className="text-xl font-medium mb-2">No Credentials Found</h3>
          <p className="text-gray-400 mb-4">You don't have any verifiable credentials yet</p>
          <a 
            href="/verify/humanity" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Icon icon="mdi:plus" />
            Verify Property
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((credential, index) => (
            <motion.div
              key={credential.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg overflow-hidden ${getCredentialColor(credential.type)}`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white/10">
                      <Icon icon={getCredentialTypeIcon(credential.type)} className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {credential.type.find(t => t !== 'VerifiableCredential')}
                      </h3>
                      <p className="text-sm opacity-70">Issued: {formatDate(credential.validFrom)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeCredential(credential.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Revoke Credential"
                  >
                    <Icon icon="mdi:delete-outline" className="text-xl" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {Object.entries(credential.credentialSubject)
                    .filter(([key]) => key !== 'id')
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize opacity-70">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">
                          {typeof value === 'boolean' 
                            ? (value ? 'Yes' : 'No')
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between text-sm opacity-70 pt-3 border-t border-current">
                  <span>Valid until: {formatDate(credential.validUntil)}</span>
                  <span title={credential.id}>ID: {credential.id.substring(0, 8)}...</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialsList; 