import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { Tooltip } from '@/components/ui/tooltip';

interface ZkVerificationBadgeProps {
  verified: boolean;
  proofId?: string;
  system?: string;
  className?: string;
}

const ZkVerificationBadge: React.FC<ZkVerificationBadgeProps> = ({
  verified,
  proofId,
  system = 'groth16',
  className = '',
}) => {
  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <p className="font-semibold mb-1">ZK Verification Status</p>
          <p className="text-sm mb-1">
            {verified ? 'Verified ✓' : 'Not Verified ✗'}
          </p>
          {proofId && (
            <p className="text-xs text-gray-400 mb-1">Proof ID: {proofId.substring(0, 8)}...</p>
          )}
          {system && (
            <p className="text-xs text-gray-400">Proof System: {system}</p>
          )}
        </div>
      }
    >
      <div className={`inline-flex items-center ${className}`}>
        {verified ? (
          <div className="flex items-center text-green-500">
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">ZK Verified</span>
            <CheckCircleIcon className="h-4 w-4 ml-1" />
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">ZK Pending</span>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export default ZkVerificationBadge; 