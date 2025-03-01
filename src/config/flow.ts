import { config } from '@onflow/fcl';

// Mock function to simulate ZK proof verification (always returns true)
const verifyWithZkVerify = async (proofData: any) => {
  console.log('Verifying proof with zkVerify:', proofData);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Always return true to ensure verification succeeds
  return true;
};

// Generate a mock proof for demonstration purposes
const generateProof = (data: any) => {
  return {
    id: `proof-${Date.now()}`,
    system: 'groth16',
    data: JSON.stringify(data),
    timestamp: new Date().toISOString()
  };
};

// Flow blockchain configuration
const flowConfig = {
  // App details
  APP_NAME: "AirSpace",
  APP_ICON: "https://airspace.com/logo.png",
  APP_DESCRIPTION: "AirSpace - Air Rights NFT Marketplace",
  
  // Flow network configuration
  FLOW_ACCESS_NODE: "https://rest-testnet.onflow.org",
  FLOW_WALLET_DISCOVERY: "https://fcl-discovery.onflow.org/testnet/authn",
  
  // Contract addresses
  FLOW_TOKEN_ADDRESS: "0x7e60df042a9c0868",
  NON_FUNGIBLE_TOKEN_ADDRESS: "0x631e88ae7f1d7c20",
  METADATA_VIEWS_ADDRESS: "0x631e88ae7f1d7c20",
  AIRSPACE_NFT_CONTRACT_ADDRESS: "0x4f50ec69447dbf04", // Using the provided wallet address
  
  // Wallet configuration
  WALLET_ADDRESS: "0x4f50ec69447dbf04",
  RECOVERY_PHRASE: "invest cotton bulb top enough cloth side lion dance permit damage random",
  
  // Transaction configuration
  DEFAULT_GAS_LIMIT: 1000,
  
  // Transaction status codes
  FLOW_TX_STATUS: {
    UNKNOWN: 0,
    PENDING: 1,
    FINALIZED: 2,
    EXECUTED: 3,
    SEALED: 4,
    EXPIRED: 5
  },
  
  // Network identifier
  NETWORK: "testnet",
  
  // zkVerify integration
  zkVerify: {
    API_ENDPOINT: 'https://api.zkverify.io/verify',
    API_KEY: 'demo_api_key_for_testing',
    verifyProof: verifyWithZkVerify,
    generateProof: generateProof,
    supportedSystems: ['groth16', 'risc0', 'noir', 'fflonk']
  }
};

// Configure FCL
config()
  .put("accessNode.api", flowConfig.FLOW_ACCESS_NODE)
  .put("discovery.wallet", flowConfig.FLOW_WALLET_DISCOVERY)
  .put("app.detail.title", flowConfig.APP_NAME)
  .put("app.detail.icon", flowConfig.APP_ICON)
  .put("app.detail.description", flowConfig.APP_DESCRIPTION)
  .put("0xFlowToken", flowConfig.FLOW_TOKEN_ADDRESS)
  .put("0xNonFungibleToken", flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS)
  .put("0xMetadataViews", flowConfig.METADATA_VIEWS_ADDRESS)
  .put("0xAirSpaceNFT", flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS);

export default flowConfig; 