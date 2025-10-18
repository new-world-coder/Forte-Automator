#!/usr/bin/env node

/**
 * Deployment script for Cadence contracts to Flow testnet
 * 
 * Prerequisites:
 * 1. Install Flow CLI: https://docs.onflow.org/flow-cli/install/
 * 2. Create Flow account: flow accounts create
 * 3. Fund account with testnet FLOW
 * 4. Update contract addresses in your environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../src/cadence/contracts');
const DEPLOYMENTS_DIR = path.join(__dirname, '../deployments');

// Contract files to deploy
const CONTRACTS = [
  {
    name: 'RuleRegistry',
    file: 'RuleRegistry.cdc',
    description: 'Main contract for managing automation rules'
  }
];

// Flow testnet configuration
const FLOW_CONFIG = {
  network: 'testnet',
  accessNode: 'https://rest-testnet.onflow.org',
  discoveryWallet: 'https://fcl-discovery.onflow.org/testnet/authn',
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkFlowCLI() {
  try {
    execSync('flow version', { stdio: 'pipe' });
    log('✅ Flow CLI is installed', 'success');
    return true;
  } catch (error) {
    log('❌ Flow CLI is not installed. Please install it first:', 'error');
    log('   https://docs.onflow.org/flow-cli/install/', 'info');
    return false;
  }
}

function checkAccount() {
  try {
    const output = execSync('flow accounts get', { stdio: 'pipe' }).toString();
    if (output.includes('No active account')) {
      log('❌ No active Flow account found', 'error');
      log('   Run: flow accounts create', 'info');
      return false;
    }
    log('✅ Active Flow account found', 'success');
    return true;
  } catch (error) {
    log('❌ Error checking Flow account', 'error');
    return false;
  }
}

function createDeploymentDirectory() {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
    log(`📁 Created deployments directory: ${DEPLOYMENTS_DIR}`, 'info');
  }
}

function deployContract(contract) {
  const contractPath = path.join(CONTRACTS_DIR, contract.file);
  
  if (!fs.existsSync(contractPath)) {
    log(`❌ Contract file not found: ${contractPath}`, 'error');
    return null;
  }

  log(`🚀 Deploying ${contract.name}...`, 'info');
  
  try {
    // Deploy the contract
    const deployCommand = `flow accounts add-contract ${contract.name} ${contractPath}`;
    const output = execSync(deployCommand, { 
      stdio: 'pipe',
      encoding: 'utf8'
    }).toString();
    
    // Extract contract address from output
    const addressMatch = output.match(/Contract\s+(\w+)\s+deployed to\s+(\w+)/);
    let contractAddress = null;
    
    if (addressMatch) {
      contractAddress = addressMatch[2];
    } else {
      // Try alternative pattern
      const altMatch = output.match(/Address:\s*(\w+)/);
      if (altMatch) {
        contractAddress = altMatch[1];
      }
    }
    
    if (contractAddress) {
      log(`✅ ${contract.name} deployed to: ${contractAddress}`, 'success');
      
      // Save deployment info
      const deploymentInfo = {
        contractName: contract.name,
        contractAddress: contractAddress,
        network: FLOW_CONFIG.network,
        deployedAt: new Date().toISOString(),
        description: contract.description,
        transactionHash: 'TBD', // Would need to extract from Flow CLI output
      };
      
      const deploymentFile = path.join(DEPLOYMENTS_DIR, `${contract.name.toLowerCase()}.json`);
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      log(`📄 Deployment info saved to: ${deploymentFile}`, 'info');
      
      return contractAddress;
    } else {
      log(`⚠️  ${contract.name} deployed but address not extracted`, 'warning');
      log(`   Check Flow CLI output:`, 'info');
      console.log(output);
      return null;
    }
    
  } catch (error) {
    log(`❌ Failed to deploy ${contract.name}:`, 'error');
    console.log(error.message);
    return null;
  }
}

function generateEnvFile(addresses) {
  const envContent = `# Flow Contract Addresses (Auto-generated - ${new Date().toISOString()})
# Copy these to your .env.local file

NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=${FLOW_CONFIG.accessNode}
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=${FLOW_CONFIG.discoveryWallet}

# Contract Addresses
${addresses.map(addr => `NEXT_PUBLIC_FORTE_CONTRACT_ADDRESS=${addr.address}`).join('\n')}

# Usage in your app:
# import { FORTE_CONTRACT_ADDRESS } from '@/lib/flow-config';
`;

  const envFile = path.join(__dirname, '../.env.deployments');
  fs.writeFileSync(envFile, envContent);
  log(`📄 Environment file generated: ${envFile}`, 'info');
  log(`   Copy the addresses to your .env.local file`, 'warning');
}

function main() {
  log('🎯 Starting Flow contract deployment...', 'info');
  log(`📍 Network: ${FLOW_CONFIG.network}`, 'info');
  
  // Pre-deployment checks
  if (!checkFlowCLI()) {
    process.exit(1);
  }
  
  if (!checkAccount()) {
    process.exit(1);
  }
  
  createDeploymentDirectory();
  
  const deployedAddresses = [];
  
  // Deploy each contract
  for (const contract of CONTRACTS) {
    const address = deployContract(contract);
    if (address) {
      deployedAddresses.push({
        contract: contract.name,
        address: address
      });
    }
  }
  
  if (deployedAddresses.length > 0) {
    log('\n🎉 Deployment Summary:', 'success');
    deployedAddresses.forEach(addr => {
      log(`   ${addr.contract}: ${addr.address}`, 'info');
    });
    
    generateEnvFile(deployedAddresses);
    
    log('\n📋 Next Steps:', 'info');
    log('   1. Copy contract addresses to your .env.local file', 'info');
    log('   2. Update your frontend code to use the new addresses', 'info');
    log('   3. Test your dApp on testnet', 'info');
    log('   4. Fund your contracts if needed for testing', 'info');
  } else {
    log('❌ No contracts were successfully deployed', 'error');
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  main();
}

module.exports = { deployContract, CONTRACTS, FLOW_CONFIG };
