"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import ZkVerificationBadge from '@/components/ZkVerificationBadge';
import zkVerifyService from '@/services/zkVerifyService';
import { ZkProof, VerificationResult } from '@/services/zkVerifyService';

const VerifyPage = () => {
  const [inputData, setInputData] = useState('');
  const [proofSystem, setProofSystem] = useState('groth16');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [proof, setProof] = useState<ZkProof | null>(null);

  const handleVerify = async () => {
    if (!inputData.trim()) {
      toast.error('Please enter some data to verify');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Parse the input data
      let dataToVerify;
      try {
        dataToVerify = JSON.parse(inputData);
      } catch (e) {
        // If not valid JSON, use as string
        dataToVerify = { text: inputData };
      }
      
      // Generate and verify the proof
      const result = await zkVerifyService.proveAndVerify(dataToVerify, proofSystem);
      
      // Get the proof that was generated
      const generatedProof = await zkVerifyService.generateProof(dataToVerify, proofSystem);
      
      setProof(generatedProof);
      setVerificationResult(result);
      
      if (result.verified) {
        toast.success('Verification successful!');
      } else {
        toast.error('Verification failed');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setInputData('');
    setProofSystem('groth16');
    setVerificationResult(null);
    setProof(null);
  };

  return (
    <div className="container mx-auto px-4 pt-36 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <h1 className="text-4xl font-bold">ZK Verification</h1>
          <div className="ml-4">
            <Icon icon="heroicons:shield-check" className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="bg-dark_grey rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Verify Data with Zero-Knowledge Proofs</h2>
          <p className="text-gray-400 mb-6">
            Enter any data below to generate and verify a zero-knowledge proof. This demonstrates how zkVerify can be used to verify data without revealing the actual data.
          </p>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Data to Verify</label>
            <textarea
              className="w-full bg-deepSlate text-white p-4 rounded-lg h-40"
              placeholder="Enter data to verify (JSON or text)"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              disabled={isVerifying}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Proof System</label>
            <select
              className="w-full bg-deepSlate text-white p-4 rounded-lg"
              value={proofSystem}
              onChange={(e) => setProofSystem(e.target.value)}
              disabled={isVerifying}
            >
              <option value="groth16">Groth16</option>
              <option value="plonk">PLONK</option>
              <option value="stark">STARK</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              className="bg-primary text-darkmode px-8 py-3 rounded-lg text-18 font-medium hover:bg-opacity-90 transition-all flex items-center"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-darkmode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:shield-check" className="mr-2" />
                  Verify
                </>
              )}
            </button>
            
            <button
              className="bg-deepSlate text-white px-8 py-3 rounded-lg text-18 font-medium hover:bg-opacity-90 transition-all"
              onClick={handleReset}
              disabled={isVerifying}
            >
              Reset
            </button>
          </div>
        </div>
        
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-dark_grey rounded-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Verification Result</h2>
            
            <div className="flex justify-center my-6">
              <ZkVerificationBadge
                verified={verificationResult.verified}
                proofId={verificationResult.proofId}
                system={verificationResult.system}
                className="scale-150"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-deepSlate p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Proof Details</h3>
                {proof && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400">Proof ID:</span>
                      <p className="text-white font-mono text-sm break-all">{proof.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">System:</span>
                      <p className="text-white">{proof.system}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp:</span>
                      <p className="text-white">{new Date(proof.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-deepSlate p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Verification Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <p className={`font-semibold ${verificationResult.verified ? 'text-green-500' : 'text-red-500'}`}>
                      {verificationResult.verified ? 'Verified ✓' : 'Not Verified ✗'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <p className="text-white">{new Date(verificationResult.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">System:</span>
                    <p className="text-white">{verificationResult.system}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage; 